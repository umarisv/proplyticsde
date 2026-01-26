/**
 * Investment AI Feedback API
 * 
 * POST /api/investment-ai/feedback
 * 
 * Submits user feedback on an evaluation to enable learning.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  submitFeedback,
  getFeedbackHistory,
  getLearningStats,
  type FeedbackRequest,
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
    const body: FeedbackRequest = await request.json()
    
    // Validate required fields
    if (!body.bewertungId || !body.feedbackType) {
      return NextResponse.json(
        { error: 'Missing required fields: bewertungId, feedbackType' },
        { status: 400 }
      )
    }
    
    // Validate feedback type
    const validTypes = ['thumbs_up', 'thumbs_down', 'deal_outcome', 'price_correction']
    if (!validTypes.includes(body.feedbackType)) {
      return NextResponse.json(
        { error: `Invalid feedbackType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Submit feedback
    const result = await submitFeedback({
      userId: user.id,
      bewertungId: body.bewertungId,
      evaluationId: body.evaluationId,
      agentId: body.agentId,
      feedbackType: body.feedbackType,
      predictedVerdict: body.predictedVerdict,
      predictedScore: body.predictedScore,
      actualOutcome: body.actualOutcome,
      priceDelta: body.priceDelta,
      notes: body.notes,
    })
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to submit feedback' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
    })
    
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url)
    const bewertungId = searchParams.get('bewertungId')
    const statsOnly = searchParams.get('stats') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    
    if (statsOnly) {
      // Return learning statistics
      const stats = await getLearningStats(user.id)
      return NextResponse.json({ success: true, stats })
    }
    
    // Return feedback history
    const history = await getFeedbackHistory(user.id, {
      bewertungId: bewertungId || undefined,
      limit,
    })
    
    return NextResponse.json({
      success: true,
      feedback: history,
    })
    
  } catch (error) {
    console.error('Feedback history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
