/**
 * Ensemble Aggregation
 * 
 * Aggregates scores from multiple investment agents into a unified recommendation.
 * Supports different aggregation strategies: voting, weighted average, conservative.
 */

import type {
  AgentScore,
  DissentReason,
  EnsembleResult,
  RiskFactor,
  Verdict,
} from './types'
import { VERDICT_LABELS } from './agent-profiles'

// ============================================================================
// Aggregation Strategies
// ============================================================================

export type AggregationStrategy = 'majority' | 'weighted' | 'conservative' | 'optimistic'

interface AggregationOptions {
  strategy?: AggregationStrategy
  conservativeWeight?: number // 0-1, how much to weight the most conservative agent
}

// ============================================================================
// Main Ensemble Function
// ============================================================================

export function aggregateEnsemble(
  agentScores: AgentScore[],
  options: AggregationOptions = {}
): EnsembleResult {
  const { strategy = 'weighted' } = options
  
  if (agentScores.length === 0) {
    return createEmptyResult()
  }
  
  // Calculate aggregated verdict based on strategy
  const { recommendation, consensusScore } = calculateAggregatedVerdict(agentScores, strategy)
  
  // Check for consensus
  const { consensus, majorityVerdict, dissent } = analyzeConsensus(agentScores)
  
  // Identify risk factors across all agents
  const riskFactors = identifyRiskFactors(agentScores)
  
  // Calculate confidence based on agent agreement and individual confidences
  const confidence = calculateEnsembleConfidence(agentScores, consensus)
  
  // Generate summary
  const summary = generateSummary(recommendation, consensusScore, agentScores, dissent, riskFactors)
  
  return {
    recommendation,
    confidence,
    consensusScore: Math.round(consensusScore),
    agentScores,
    consensus,
    majorityVerdict,
    dissent,
    riskFactors,
    summary,
  }
}

// ============================================================================
// Aggregation Logic
// ============================================================================

function calculateAggregatedVerdict(
  agentScores: AgentScore[],
  strategy: AggregationStrategy
): { recommendation: Verdict; consensusScore: number } {
  switch (strategy) {
    case 'majority':
      return majorityVoting(agentScores)
    
    case 'weighted':
      return weightedAverage(agentScores)
    
    case 'conservative':
      return conservativeApproach(agentScores)
    
    case 'optimistic':
      return optimisticApproach(agentScores)
    
    default:
      return weightedAverage(agentScores)
  }
}

function majorityVoting(agentScores: AgentScore[]): { recommendation: Verdict; consensusScore: number } {
  const verdictCounts: Record<Verdict, number> = { go: 0, maybe: 0, no_go: 0 }
  let totalScore = 0
  
  for (const score of agentScores) {
    verdictCounts[score.verdict]++
    totalScore += score.totalScore
  }
  
  const avgScore = totalScore / agentScores.length
  
  // Determine majority
  const sortedVerdicts = Object.entries(verdictCounts)
    .sort(([, a], [, b]) => b - a)
  
  const [topVerdict, topCount] = sortedVerdicts[0]
  
  // If no clear majority, use average score to decide
  if (topCount === 1 && agentScores.length === 3) {
    // All different - use score-based decision
    if (avgScore >= 75) return { recommendation: 'go', consensusScore: avgScore }
    if (avgScore >= 60) return { recommendation: 'maybe', consensusScore: avgScore }
    return { recommendation: 'no_go', consensusScore: avgScore }
  }
  
  return { recommendation: topVerdict as Verdict, consensusScore: avgScore }
}

function weightedAverage(agentScores: AgentScore[]): { recommendation: Verdict; consensusScore: number } {
  // Weight agents by their confidence
  let weightedSum = 0
  let totalWeight = 0
  
  for (const score of agentScores) {
    const weight = 0.5 + score.confidence * 0.5 // Confidence affects weight
    weightedSum += score.totalScore * weight
    totalWeight += weight
  }
  
  const avgScore = weightedSum / totalWeight
  
  // Use standard decision rules
  if (avgScore >= 75) return { recommendation: 'go', consensusScore: avgScore }
  if (avgScore >= 60) return { recommendation: 'maybe', consensusScore: avgScore }
  return { recommendation: 'no_go', consensusScore: avgScore }
}

function conservativeApproach(agentScores: AgentScore[]): { recommendation: Verdict; consensusScore: number } {
  // Use the most conservative (lowest) score
  const minScore = Math.min(...agentScores.map(s => s.totalScore))
  const avgScore = agentScores.reduce((sum, s) => sum + s.totalScore, 0) / agentScores.length
  
  // Weight towards conservative
  const conservativeScore = minScore * 0.6 + avgScore * 0.4
  
  // If any agent says NO-GO with critical deal killers, follow that
  const hasNogowithDealKillers = agentScores.some(
    s => s.verdict === 'no_go' && s.dealKillers.some(dk => dk.severity === 'critical')
  )
  
  if (hasNogowithDealKillers) {
    return { recommendation: 'no_go', consensusScore: conservativeScore }
  }
  
  if (conservativeScore >= 75) return { recommendation: 'go', consensusScore: conservativeScore }
  if (conservativeScore >= 60) return { recommendation: 'maybe', consensusScore: conservativeScore }
  return { recommendation: 'no_go', consensusScore: conservativeScore }
}

function optimisticApproach(agentScores: AgentScore[]): { recommendation: Verdict; consensusScore: number } {
  // Use the most optimistic (highest) score
  const maxScore = Math.max(...agentScores.map(s => s.totalScore))
  const avgScore = agentScores.reduce((sum, s) => sum + s.totalScore, 0) / agentScores.length
  
  // Weight towards optimistic
  const optimisticScore = maxScore * 0.6 + avgScore * 0.4
  
  // Still respect critical deal killers
  const allHaveCriticalKillers = agentScores.every(
    s => s.dealKillers.some(dk => dk.severity === 'critical')
  )
  
  if (allHaveCriticalKillers) {
    return { recommendation: 'no_go', consensusScore: optimisticScore }
  }
  
  if (optimisticScore >= 75) return { recommendation: 'go', consensusScore: optimisticScore }
  if (optimisticScore >= 60) return { recommendation: 'maybe', consensusScore: optimisticScore }
  return { recommendation: 'no_go', consensusScore: optimisticScore }
}

// ============================================================================
// Consensus Analysis
// ============================================================================

function analyzeConsensus(agentScores: AgentScore[]): {
  consensus: boolean
  majorityVerdict: Verdict
  dissent: DissentReason[]
} {
  const verdictCounts: Record<Verdict, number> = { go: 0, maybe: 0, no_go: 0 }
  
  for (const score of agentScores) {
    verdictCounts[score.verdict]++
  }
  
  // Find majority verdict
  const sortedVerdicts = Object.entries(verdictCounts)
    .sort(([, a], [, b]) => b - a)
  const majorityVerdict = sortedVerdicts[0][0] as Verdict
  
  // Check if all agree
  const consensus = verdictCounts[majorityVerdict] === agentScores.length
  
  // Identify dissenting agents
  const dissent: DissentReason[] = []
  for (const score of agentScores) {
    if (score.verdict !== majorityVerdict) {
      dissent.push({
        agentId: score.agentId,
        agentName: score.agentName,
        verdict: score.verdict,
        reason: generateDissentReason(score, majorityVerdict),
      })
    }
  }
  
  return { consensus, majorityVerdict, dissent }
}

function generateDissentReason(score: AgentScore, majorityVerdict: Verdict): string {
  if (score.verdict === 'no_go' && majorityVerdict !== 'no_go') {
    if (score.dealKillers.length > 0) {
      return `Deal-Killer: ${score.dealKillers[0].label}`
    }
    return `Score zu niedrig (${score.totalScore}/100)`
  }
  
  if (score.verdict === 'go' && majorityVerdict !== 'go') {
    return `Sieht Potenzial (Score: ${score.totalScore}/100)`
  }
  
  return `Abweichende Bewertung (${score.totalScore}/100)`
}

// ============================================================================
// Risk Factor Analysis
// ============================================================================

function identifyRiskFactors(agentScores: AgentScore[]): RiskFactor[] {
  const riskFactors: RiskFactor[] = []
  const seenRisks = new Set<string>()
  
  // Collect deal killers from all agents
  for (const score of agentScores) {
    for (const dk of score.dealKillers) {
      const key = dk.rule
      if (!seenRisks.has(key)) {
        seenRisks.add(key)
        riskFactors.push({
          category: dk.rule,
          level: dk.severity === 'critical' ? 'critical' : 'high',
          description: dk.label,
          value: dk.actualValue,
          threshold: dk.threshold,
        })
      }
    }
  }
  
  // Identify low-scoring categories across agents
  const categoryScoreMap = new Map<string, number[]>()
  
  for (const score of agentScores) {
    for (const cs of score.categoryScores) {
      const existing = categoryScoreMap.get(cs.category) ?? []
      existing.push(cs.score)
      categoryScoreMap.set(cs.category, existing)
    }
  }
  
  for (const [category, scores] of categoryScoreMap.entries()) {
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
    
    if (avgScore < 40 && !seenRisks.has(category)) {
      riskFactors.push({
        category,
        level: avgScore < 25 ? 'high' : 'medium',
        description: `Schwache Bewertung in ${category}`,
        value: Math.round(avgScore),
      })
    }
  }
  
  // Sort by severity
  const levelOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  riskFactors.sort((a, b) => levelOrder[a.level] - levelOrder[b.level])
  
  return riskFactors
}

// ============================================================================
// Confidence Calculation
// ============================================================================

function calculateEnsembleConfidence(agentScores: AgentScore[], consensus: boolean): number {
  // Base confidence is average of agent confidences
  const avgConfidence = agentScores.reduce((sum, s) => sum + s.confidence, 0) / agentScores.length
  
  // Boost confidence if all agents agree
  if (consensus) {
    return Math.min(1, avgConfidence * 1.2)
  }
  
  // Reduce confidence if agents disagree
  const verdicts = new Set(agentScores.map(s => s.verdict))
  if (verdicts.size === 3) {
    // All three disagree - low confidence
    return avgConfidence * 0.6
  }
  
  // Two agree, one disagrees
  return avgConfidence * 0.85
}

// ============================================================================
// Summary Generation
// ============================================================================

function generateSummary(
  recommendation: Verdict,
  consensusScore: number,
  agentScores: AgentScore[],
  dissent: DissentReason[],
  riskFactors: RiskFactor[]
): string {
  const parts: string[] = []
  
  // Recommendation
  const verdictInfo = VERDICT_LABELS[recommendation]
  parts.push(`Empfehlung: ${verdictInfo.label} (${Math.round(consensusScore)}/100)`)
  
  // Consensus info
  if (dissent.length === 0) {
    parts.push(`Alle ${agentScores.length} Investoren sind einig.`)
  } else {
    const agreeing = agentScores.length - dissent.length
    parts.push(`${agreeing} von ${agentScores.length} Investoren stimmen zu.`)
    
    // Mention dissent
    if (dissent.length > 0) {
      parts.push(`${dissent[0].agentName} sagt ${VERDICT_LABELS[dissent[0].verdict].label}: ${dissent[0].reason}`)
    }
  }
  
  // Top risks
  const criticalRisks = riskFactors.filter(r => r.level === 'critical' || r.level === 'high')
  if (criticalRisks.length > 0) {
    parts.push(`Hauptrisiken: ${criticalRisks.slice(0, 2).map(r => r.description).join(', ')}`)
  }
  
  return parts.join(' ')
}

// ============================================================================
// Helper Functions
// ============================================================================

function createEmptyResult(): EnsembleResult {
  return {
    recommendation: 'no_go',
    confidence: 0,
    consensusScore: 0,
    agentScores: [],
    consensus: true,
    majorityVerdict: 'no_go',
    dissent: [],
    riskFactors: [],
    summary: 'Keine Agenten-Bewertungen verfügbar.',
  }
}

/**
 * Get a simplified verdict comparison for display
 */
export function getVerdictComparison(agentScores: AgentScore[]): Array<{
  agentId: string
  agentName: string
  verdict: Verdict
  score: number
  minYield: number
}> {
  return agentScores.map(score => {
    // Extract minimum yield from agent name or use default
    const minYieldMap: Record<string, number> = {
      immocation: 4.5,
      hoerhan: 5.0,
      raue: 6.0,
    }
    
    return {
      agentId: score.agentId,
      agentName: score.agentName,
      verdict: score.verdict,
      score: score.totalScore,
      minYield: minYieldMap[score.agentId] ?? 5.0,
    }
  })
}
