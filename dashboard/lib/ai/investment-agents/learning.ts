/**
 * Learning Engine
 * 
 * Implements the self-learning mechanism for the investment agents.
 * Updates scoring weights based on user feedback and deal outcomes.
 */

import { createClient } from '@/lib/supabase/client'
import type {
  AgentWeights,
  AgentWeightsRow,
  AssetClass,
  EvaluationFeedback,
  EvaluationFeedbackRow,
  FeedbackType,
  ScoringWeights,
  Verdict,
} from './types'
import { mapRowToWeights } from './types'

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_LEARNING_RATE = 0.1
const MIN_CONFIDENCE = 0.1
const MAX_CONFIDENCE = 0.95
const CONFIDENCE_DECAY = 0.01 // Per day without feedback

// ============================================================================
// Feedback Processing
// ============================================================================

export async function submitFeedback(feedback: EvaluationFeedback): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    // Insert feedback record
    const { error: insertError } = await supabase
      .from('evaluation_feedback')
      .insert({
        user_id: feedback.userId,
        bewertung_id: feedback.bewertungId,
        evaluation_id: feedback.evaluationId,
        agent_id: feedback.agentId,
        feedback_type: feedback.feedbackType,
        predicted_verdict: feedback.predictedVerdict,
        predicted_score: feedback.predictedScore,
        actual_outcome: feedback.actualOutcome,
        price_delta: feedback.priceDelta,
        notes: feedback.notes,
      })
    
    if (insertError) {
      console.error('Error inserting feedback:', insertError)
      return { success: false, error: insertError.message }
    }
    
    // Update weights if agent-specific feedback
    if (feedback.agentId) {
      await updateAgentWeights(feedback)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return { success: false, error: String(error) }
  }
}

// ============================================================================
// Weight Updates
// ============================================================================

async function updateAgentWeights(feedback: EvaluationFeedback): Promise<void> {
  const supabase = createClient()
  
  if (!feedback.agentId) return
  
  // Get current weights for this user/agent
  const { data: existingWeights } = await supabase
    .from('agent_weights')
    .select('*')
    .eq('user_id', feedback.userId)
    .eq('agent_id', feedback.agentId)
    .single()
  
  // Determine adjustment direction based on feedback
  const adjustment = calculateAdjustment(feedback)
  
  if (existingWeights) {
    // Update existing weights
    const newWeights = applyWeightAdjustment(
      existingWeights.weights as ScoringWeights,
      adjustment,
      DEFAULT_LEARNING_RATE
    )
    const newConfidence = calculateNewConfidence(
      existingWeights.confidence,
      existingWeights.feedback_count,
      feedback
    )
    
    await supabase
      .from('agent_weights')
      .update({
        weights: newWeights,
        confidence: newConfidence,
        feedback_count: existingWeights.feedback_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingWeights.id)
  } else {
    // Create new weights entry with slight adjustment from default
    // We don't know the asset class here, so we'll need to handle this differently
    // For now, skip creating new weights - they'll be created on first evaluation
  }
}

interface WeightAdjustment {
  direction: 'increase' | 'decrease' | 'neutral'
  magnitude: number // 0-1
  affectedCategories: string[]
}

function calculateAdjustment(feedback: EvaluationFeedback): WeightAdjustment {
  switch (feedback.feedbackType) {
    case 'thumbs_up':
      // Positive feedback - increase confidence, slight weight boost
      return {
        direction: 'increase',
        magnitude: 0.05,
        affectedCategories: ['price_yield', 'cashflow_dscr'],
      }
    
    case 'thumbs_down':
      // Negative feedback - decrease confidence, adjust weights
      return {
        direction: 'decrease',
        magnitude: 0.1,
        affectedCategories: ['price_yield', 'condition_capex'],
      }
    
    case 'deal_outcome':
      // Outcome-based learning
      if (feedback.actualOutcome === 'purchased' && feedback.predictedVerdict === 'go') {
        // Correct GO prediction
        return { direction: 'increase', magnitude: 0.1, affectedCategories: [] }
      }
      if (feedback.actualOutcome === 'rejected' && feedback.predictedVerdict === 'no_go') {
        // Correct NO-GO prediction
        return { direction: 'increase', magnitude: 0.1, affectedCategories: [] }
      }
      // Wrong prediction
      return { direction: 'decrease', magnitude: 0.15, affectedCategories: [] }
    
    case 'price_correction':
      // Adjust based on price delta
      const delta = feedback.priceDelta ?? 0
      if (Math.abs(delta) < 5) {
        // Price was close - good prediction
        return { direction: 'increase', magnitude: 0.05, affectedCategories: ['price_yield'] }
      }
      if (delta > 0) {
        // Market was higher than predicted - undervalued
        return { direction: 'increase', magnitude: 0.1, affectedCategories: ['price_yield'] }
      }
      // Market was lower than predicted - overvalued
      return { direction: 'decrease', magnitude: 0.1, affectedCategories: ['price_yield'] }
    
    default:
      return { direction: 'neutral', magnitude: 0, affectedCategories: [] }
  }
}

function applyWeightAdjustment(
  weights: ScoringWeights,
  adjustment: WeightAdjustment,
  learningRate: number
): ScoringWeights {
  if (adjustment.direction === 'neutral') {
    return weights
  }
  
  const newWeights = { ...weights }
  const multiplier = adjustment.direction === 'increase' 
    ? 1 + adjustment.magnitude * learningRate
    : 1 - adjustment.magnitude * learningRate
  
  // If specific categories are targeted, adjust those
  if (adjustment.affectedCategories.length > 0) {
    for (const category of adjustment.affectedCategories) {
      if (newWeights[category] !== undefined) {
        newWeights[category] = Math.max(5, Math.min(40, (newWeights[category] ?? 10) * multiplier))
      }
    }
  }
  
  // Normalize weights to sum to 100
  const total = Object.values(newWeights).reduce((sum, w) => sum + (w ?? 0), 0)
  if (total > 0) {
    for (const key of Object.keys(newWeights)) {
      if (newWeights[key] !== undefined) {
        newWeights[key] = (newWeights[key]! / total) * 100
      }
    }
  }
  
  return newWeights
}

function calculateNewConfidence(
  currentConfidence: number,
  feedbackCount: number,
  feedback: EvaluationFeedback
): number {
  const adjustment = calculateAdjustment(feedback)
  
  // Base confidence change
  let delta = 0
  if (adjustment.direction === 'increase') {
    delta = 0.02 + 0.01 * Math.min(feedbackCount / 10, 1)
  } else if (adjustment.direction === 'decrease') {
    delta = -0.03 - 0.02 * (1 - Math.min(feedbackCount / 10, 1))
  }
  
  const newConfidence = currentConfidence + delta
  return Math.max(MIN_CONFIDENCE, Math.min(MAX_CONFIDENCE, newConfidence))
}

// ============================================================================
// Weight Retrieval
// ============================================================================

export async function getLearnedWeights(
  userId: string,
  agentId: string,
  assetClass: AssetClass
): Promise<AgentWeights | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('agent_weights')
    .select('*')
    .eq('user_id', userId)
    .eq('agent_id', agentId)
    .eq('asset_class', assetClass)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return mapRowToWeights(data as AgentWeightsRow)
}

export async function getAllUserWeights(userId: string): Promise<AgentWeights[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('agent_weights')
    .select('*')
    .eq('user_id', userId)
  
  if (error || !data) {
    return []
  }
  
  return (data as AgentWeightsRow[]).map(mapRowToWeights)
}

// ============================================================================
// Feedback History
// ============================================================================

export async function getFeedbackHistory(
  userId: string,
  options: { limit?: number; bewertungId?: string } = {}
): Promise<EvaluationFeedback[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('evaluation_feedback')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (options.bewertungId) {
    query = query.eq('bewertung_id', options.bewertungId)
  }
  
  if (options.limit) {
    query = query.limit(options.limit)
  }
  
  const { data, error } = await query
  
  if (error || !data) {
    return []
  }
  
  return (data as EvaluationFeedbackRow[]).map(row => ({
    id: row.id,
    userId: row.user_id,
    bewertungId: row.bewertung_id,
    evaluationId: row.evaluation_id ?? undefined,
    agentId: row.agent_id ?? undefined,
    feedbackType: row.feedback_type,
    predictedVerdict: row.predicted_verdict ?? undefined,
    predictedScore: row.predicted_score ?? undefined,
    actualOutcome: row.actual_outcome ?? undefined,
    priceDelta: row.price_delta ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  }))
}

// ============================================================================
// Learning Statistics
// ============================================================================

export interface LearningStats {
  totalFeedback: number
  positiveFeedback: number
  negativeFeedback: number
  dealOutcomes: number
  averageConfidence: number
  agentStats: Record<string, {
    feedbackCount: number
    confidence: number
    lastUpdated: string
  }>
}

export async function getLearningStats(userId: string): Promise<LearningStats> {
  const supabase = createClient()
  
  // Get feedback counts
  const { data: feedbackData } = await supabase
    .from('evaluation_feedback')
    .select('feedback_type')
    .eq('user_id', userId)
  
  const feedbackCounts = {
    total: 0,
    positive: 0,
    negative: 0,
    outcomes: 0,
  }
  
  if (feedbackData) {
    for (const fb of feedbackData) {
      feedbackCounts.total++
      if (fb.feedback_type === 'thumbs_up') feedbackCounts.positive++
      if (fb.feedback_type === 'thumbs_down') feedbackCounts.negative++
      if (fb.feedback_type === 'deal_outcome') feedbackCounts.outcomes++
    }
  }
  
  // Get agent weights
  const { data: weightsData } = await supabase
    .from('agent_weights')
    .select('agent_id, confidence, feedback_count, updated_at')
    .eq('user_id', userId)
  
  const agentStats: LearningStats['agentStats'] = {}
  let totalConfidence = 0
  let confidenceCount = 0
  
  if (weightsData) {
    for (const w of weightsData) {
      if (!agentStats[w.agent_id]) {
        agentStats[w.agent_id] = {
          feedbackCount: 0,
          confidence: w.confidence,
          lastUpdated: w.updated_at,
        }
      }
      agentStats[w.agent_id].feedbackCount += w.feedback_count
      totalConfidence += w.confidence
      confidenceCount++
    }
  }
  
  return {
    totalFeedback: feedbackCounts.total,
    positiveFeedback: feedbackCounts.positive,
    negativeFeedback: feedbackCounts.negative,
    dealOutcomes: feedbackCounts.outcomes,
    averageConfidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0.5,
    agentStats,
  }
}

// ============================================================================
// Initialize Weights for New User
// ============================================================================

export async function initializeWeightsForUser(
  userId: string,
  agentId: string,
  assetClass: AssetClass,
  baseWeights: ScoringWeights
): Promise<AgentWeights> {
  const supabase = createClient()
  
  const newWeights: Omit<AgentWeightsRow, 'id' | 'created_at'> = {
    user_id: userId,
    agent_id: agentId,
    asset_class: assetClass,
    weights: baseWeights,
    confidence: 0.5,
    feedback_count: 0,
    updated_at: new Date().toISOString(),
  }
  
  const { data, error } = await supabase
    .from('agent_weights')
    .upsert(newWeights, { onConflict: 'user_id,agent_id,asset_class' })
    .select()
    .single()
  
  if (error || !data) {
    // Return default weights if insert fails
    return {
      id: '',
      userId,
      agentId,
      assetClass,
      weights: baseWeights,
      confidence: 0.5,
      feedbackCount: 0,
      updatedAt: new Date().toISOString(),
    }
  }
  
  return mapRowToWeights(data as AgentWeightsRow)
}
