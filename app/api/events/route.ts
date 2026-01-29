import { NextRequest, NextResponse } from 'next/server'
import { createUntypedClient } from '@/lib/supabase/server'
import { AppError, formatErrorResponse, ErrorCodes } from '@/lib/error-handler'
import type { Event } from '@/types/database.types'

// GET - List all events
export async function GET(request: NextRequest) {
  try {
    const supabase = await createUntypedClient()
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')
    const eventType = searchParams.get('eventType')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })

    if (status) query = query.eq('status', status)
    if (eventType) query = query.eq('event_type', eventType)
    if (search) query = query.ilike('name', `%${search}%`)

    query = query
      .order('event_date', { ascending: true })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    const events = (data || []) as Event[]
    // Get registration counts
    const eventIds = events.map(e => e.id)
    const { data: regCounts } = await supabase
      .from('event_registrations')
      .select('event_id')
      .in('event_id', eventIds)

    const regCountMap = (regCounts || []).reduce((acc: Record<string, number>, r: { event_id: string }) => {
      acc[r.event_id] = (acc[r.event_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const eventsWithRegs = events.map(e => ({
      ...e,
      registration_count: regCountMap[e.id] || 0,
    }))

    return NextResponse.json({
      success: true,
      data: eventsWithRegs,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('GET /api/events error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al obtener eventos', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

// POST - Create a new event
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    const body = await request.json()

    const { name, event_date, created_by } = body
    
    if (!name || !event_date) {
      throw new AppError('Faltan campos requeridos', ErrorCodes.VALIDATION_ERROR, 400)
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        name,
        event_date,
        created_by,
        description: body.description,
        event_type: body.event_type,
        location: body.location,
        ticket_price: body.ticket_price,
        max_capacity: body.max_capacity,
        registration_deadline: body.registration_deadline,
        status: 'upcoming',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/events error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al crear evento', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

// PATCH - Update an event
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      throw new AppError('ID de evento requerido', ErrorCodes.VALIDATION_ERROR, 400)
    }

    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('PATCH /api/events error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al actualizar evento', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

// DELETE - Delete an event
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      throw new AppError('ID de evento requerido', ErrorCodes.VALIDATION_ERROR, 400)
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/events error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al eliminar evento', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
