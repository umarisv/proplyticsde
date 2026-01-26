/**
 * Investment AI Profiles API
 * 
 * GET /api/investment-ai/profiles - List all available profiles
 * POST /api/investment-ai/profiles - Create a custom profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  mapRowToProfile,
  SYSTEM_AGENTS,
  type AgentProfile,
  type AgentProfileRow,
  type CreateCustomProfileRequest,
} from '@/lib/ai/investment-agents'

export const runtime = 'nodejs'

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
    const includeCustom = searchParams.get('includeCustom') !== 'false'
    const activeOnly = searchParams.get('activeOnly') !== 'false'
    
    // Build query
    let query = supabase.from('agent_profiles').select('*')
    
    if (activeOnly) {
      query = query.eq('is_active', true)
    }
    
    if (includeCustom) {
      query = query.or(`is_system.eq.true,user_id.eq.${user.id}`)
    } else {
      query = query.eq('is_system', true)
    }
    
    const { data, error } = await query.order('is_system', { ascending: false })
    
    if (error) {
      console.error('Error fetching profiles:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      )
    }
    
    const profiles = (data as AgentProfileRow[]).map(mapRowToProfile)
    
    return NextResponse.json({
      success: true,
      profiles,
    })
    
  } catch (error) {
    console.error('Profiles fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    
    const body: CreateCustomProfileRequest = await request.json()
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }
    
    // Generate unique ID for custom profile
    const profileId = `custom_${user.id.slice(0, 8)}_${Date.now()}`
    
    // If baseProfileId is provided, clone that profile's config
    let config = body.config
    if (body.baseProfileId && (!config || Object.keys(config).length === 0)) {
      const baseProfile = SYSTEM_AGENTS[body.baseProfileId]
      if (baseProfile) {
        config = { ...baseProfile.config, ...body.config }
      }
    }
    
    // Validate config has required fields
    if (!config || !config.scoring_weights || !config.min_thresholds || !config.decision_rules) {
      return NextResponse.json(
        { error: 'Config must include scoring_weights, min_thresholds, and decision_rules' },
        { status: 400 }
      )
    }
    
    // Insert new profile
    const { data, error } = await supabase
      .from('agent_profiles')
      .insert({
        id: profileId,
        user_id: user.id,
        name: body.name,
        description: body.description,
        config,
        is_system: false,
        is_active: true,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating profile:', error)
      return NextResponse.json(
        { error: 'Failed to create profile', details: error.message },
        { status: 500 }
      )
    }
    
    const profile = mapRowToProfile(data as AgentProfileRow)
    
    return NextResponse.json({
      success: true,
      profile,
    })
    
  } catch (error) {
    console.error('Profile creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
