/**
 * Investment AI Profile Management API
 * 
 * GET /api/investment-ai/profiles/[id] - Get a specific profile
 * PUT /api/investment-ai/profiles/[id] - Update a custom profile
 * DELETE /api/investment-ai/profiles/[id] - Delete a custom profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  mapRowToProfile,
  type AgentProfileRow,
} from '@/lib/ai/investment-agents'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createClient()
    const { id } = await context.params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Fetch profile
    const { data, error } = await supabase
      .from('agent_profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !data) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    
    const profile = data as AgentProfileRow
    
    // Check access: system profiles are accessible to all, custom only to owner
    if (!profile.is_system && profile.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    return NextResponse.json({
      success: true,
      profile: mapRowToProfile(profile),
    })
    
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createClient()
    const { id } = await context.params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if profile exists and is owned by user
    const { data: existing } = await supabase
      .from('agent_profiles')
      .select('is_system, user_id')
      .eq('id', id)
      .single()
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    
    if (existing.is_system) {
      return NextResponse.json(
        { error: 'Cannot modify system profiles' },
        { status: 403 }
      )
    }
    
    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    // Parse update data
    const body = await request.json()
    const updates: Record<string, unknown> = {}
    
    if (body.name) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.config) updates.config = body.config
    if (body.isActive !== undefined) updates.is_active = body.isActive
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }
    
    // Update profile
    const { data, error } = await supabase
      .from('agent_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      profile: mapRowToProfile(data as AgentProfileRow),
    })
    
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createClient()
    const { id } = await context.params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if profile exists and is owned by user
    const { data: existing } = await supabase
      .from('agent_profiles')
      .select('is_system, user_id')
      .eq('id', id)
      .single()
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    
    if (existing.is_system) {
      return NextResponse.json(
        { error: 'Cannot delete system profiles' },
        { status: 403 }
      )
    }
    
    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    // Delete profile
    const { error } = await supabase
      .from('agent_profiles')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting profile:', error)
      return NextResponse.json(
        { error: 'Failed to delete profile' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully',
    })
    
  } catch (error) {
    console.error('Profile deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
