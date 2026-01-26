/**
 * Investment AI Evaluation API
 * 
 * POST /api/investment-ai/evaluate
 * 
 * Evaluates a property using multiple investment agent profiles
 * and returns an ensemble recommendation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  scoreProperty,
  enrichPropertyData,
  aggregateEnsemble,
  getLearnedWeights,
  mapRowToProfile,
  type AgentProfile,
  type AgentProfileRow,
  type AgentScore,
  type EvaluationRequest,
  type EvaluationResponse,
  type PropertyEvaluationInput,
} from '@/lib/ai/investment-agents'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body: EvaluationRequest = await request.json()
    const { propertyData, bewertungId, selectedAgents, includeCustomAgents = true } = body
    
    // Validate property data
    if (!propertyData || !propertyData.objekttyp || !propertyData.kaufpreis) {
      return NextResponse.json(
        { error: 'Invalid property data. Required: objekttyp, kaufpreis' },
        { status: 400 }
      )
    }
    
    // Enrich property data with calculated metrics
    const enrichedProperty = enrichPropertyData(propertyData)
    
    // Get agent profiles
    const profiles = await getAgentProfiles(supabase, user.id, selectedAgents, includeCustomAgents)
    
    if (profiles.length === 0) {
      return NextResponse.json(
        { error: 'No agent profiles available' },
        { status: 400 }
      )
    }
    
    // Score property with each agent
    const agentScores: AgentScore[] = []
    
    for (const profile of profiles) {
      // Get learned weights for this user/agent/asset class
      const learnedWeights = await getLearnedWeights(
        user.id,
        profile.id,
        enrichedProperty.objekttyp
      )
      
      const score = scoreProperty(enrichedProperty, profile, learnedWeights ?? undefined)
      agentScores.push(score)
    }
    
    // Aggregate ensemble result
    const ensembleResult = aggregateEnsemble(agentScores)
    
    // Save evaluation history
    const evaluationId = await saveEvaluationHistory(
      supabase,
      user.id,
      bewertungId,
      enrichedProperty,
      agentScores,
      ensembleResult
    )
    
    const response: EvaluationResponse = {
      success: true,
      evaluationId,
      result: ensembleResult,
      timestamp: new Date().toISOString(),
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Investment AI evaluation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

async function getAgentProfiles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  selectedAgents?: string[],
  includeCustomAgents?: boolean
): Promise<AgentProfile[]> {
  let query = supabase
    .from('agent_profiles')
    .select('*')
    .eq('is_active', true)
  
  if (selectedAgents && selectedAgents.length > 0) {
    // Only get selected agents
    query = query.in('id', selectedAgents)
  } else {
    // Get system agents and optionally user's custom agents
    if (includeCustomAgents) {
      query = query.or(`is_system.eq.true,user_id.eq.${userId}`)
    } else {
      query = query.eq('is_system', true)
    }
  }
  
  const { data, error } = await query
  
  if (error || !data) {
    console.error('Error fetching agent profiles:', error)
    return []
  }
  
  return (data as AgentProfileRow[]).map(mapRowToProfile)
}

async function saveEvaluationHistory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  bewertungId: string | undefined,
  propertyData: PropertyEvaluationInput,
  agentScores: AgentScore[],
  ensembleResult: ReturnType<typeof aggregateEnsemble>
): Promise<string> {
  const { data, error } = await supabase
    .from('evaluation_history')
    .insert({
      user_id: userId,
      bewertung_id: bewertungId,
      property_data: propertyData,
      agent_scores: agentScores,
      ensemble_result: ensembleResult,
      market_estimate: propertyData.marktwert,
      asking_price: propertyData.kaufpreis,
    })
    .select('id')
    .single()
  
  if (error) {
    console.error('Error saving evaluation history:', error)
    return crypto.randomUUID() // Return a temporary ID if save fails
  }
  
  return data.id
}
