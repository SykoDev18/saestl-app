import { NextRequest, NextResponse } from 'next/server'
import { createUntypedClient } from '@/lib/supabase/server'
import { AppError, formatErrorResponse, ErrorCodes } from '@/lib/error-handler'
import type { Event, EventRegistration } from '@/types/database.types'

// GET - Get event registrations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createUntypedClient()
    const { id } = await params

    // Get event
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (eventError || !eventData) throw new AppError('Evento no encontrado', ErrorCodes.DB_NOT_FOUND, 404)

    const event = eventData as Event

    // Get registrations
    const { data: regData, error: regError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', id)
      .order('registration_date', { ascending: false })

    if (regError) throw regError

    const registrations = (regData || []) as EventRegistration[]
    const paidCount = registrations.filter(r => r.payment_status === 'paid').length
    const attendedCount = registrations.filter(r => r.attendance_status === 'attended').length

    return NextResponse.json({
      success: true,
      data: {
        event,
        registrations,
        stats: {
          total: registrations.length,
          paid: paidCount,
          pending: registrations.length - paidCount,
          attended: attendedCount,
          available: event.max_capacity ? event.max_capacity - registrations.length : null,
          revenue: paidCount * (event.ticket_price || 0),
        },
      },
    })
  } catch (error) {
    console.error('GET /api/events/[id]/registrations error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al obtener registros', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

// POST - Register participant
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createUntypedClient()
    const { id } = await params
    const body = await request.json()

    // Check if event exists
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (eventError || !eventData) throw new AppError('Evento no encontrado', ErrorCodes.DB_NOT_FOUND, 404)
    
    const event = eventData as Event
    
    // Check capacity
    if (event.max_capacity) {
      const { count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id)

      if (count && count >= event.max_capacity) {
        throw new AppError('El evento ha alcanzado su capacidad máxima', ErrorCodes.EVENT_FULL, 400)
      }
    }

    // Validate required fields
    const { participant_name, participant_email, participant_phone } = body
    if (!participant_name || !participant_email || !participant_phone) {
      throw new AppError('Faltan campos requeridos', ErrorCodes.VALIDATION_ERROR, 400)
    }

    // Create registration
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: id,
        participant_name,
        participant_email,
        participant_phone,
        registered_by: body.registered_by,
        payment_status: body.payment_status || 'pending',
        attendance_status: 'registered',
        notes: body.notes,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/events/[id]/registrations error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al registrar participante', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

// PATCH - Update registration (attendance, payment)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createUntypedClient()
    const body = await request.json()
    const { registration_id, ...updates } = body

    if (!registration_id) {
      throw new AppError('ID de registro requerido', ErrorCodes.VALIDATION_ERROR, 400)
    }

    const { data, error } = await supabase
      .from('event_registrations')
      .update(updates)
      .eq('id', registration_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('PATCH /api/events/[id]/registrations error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al actualizar registro', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
