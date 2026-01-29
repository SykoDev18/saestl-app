import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AppError, formatErrorResponse, ErrorCodes } from '@/lib/error-handler'
import type { Raffle, RaffleTicket } from '@/types/database.types'

// GET - List all raffles
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('raffles')
      .select('*', { count: 'exact' })

    if (status) query = query.eq('status', status)
    if (search) query = query.ilike('name', `%${search}%`)

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    const raffles = (data || []) as Raffle[]
    
    // Get ticket counts for each raffle
    const raffleIds = raffles.map(r => r.id)
    const { data: ticketCounts } = await supabase
      .from('raffle_tickets')
      .select('raffle_id')
      .in('raffle_id', raffleIds)

    const tickets = (ticketCounts || []) as Pick<RaffleTicket, 'raffle_id'>[]
    
    // Count tickets per raffle
    const ticketCountMap = tickets.reduce((acc, t) => {
      acc[t.raffle_id] = (acc[t.raffle_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Add sold_tickets to each raffle
    const rafflesWithTickets = raffles.map(r => ({
      ...r,
      sold_tickets: ticketCountMap[r.id] || 0,
    }))

    return NextResponse.json({
      success: true,
      data: rafflesWithTickets,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('GET /api/raffles error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al obtener rifas', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

// POST - Create a new raffle
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { name, ticket_price, total_tickets, start_date, end_date, created_by } = body
    
    if (!name || !ticket_price || !total_tickets || !start_date || !end_date) {
      throw new AppError('Faltan campos requeridos', ErrorCodes.VALIDATION_ERROR, 400)
    }

    if (ticket_price <= 0) {
      throw new AppError('El precio del boleto debe ser mayor a 0', ErrorCodes.VALIDATION_ERROR, 400)
    }

    if (total_tickets <= 0) {
      throw new AppError('El total de boletos debe ser mayor a 0', ErrorCodes.VALIDATION_ERROR, 400)
    }

    const { data, error } = await supabase
      .from('raffles')
      .insert({
        name,
        ticket_price,
        total_tickets,
        start_date,
        end_date,
        created_by,
        description: body.description,
        prize_description: body.prize_description,
        status: 'active',
      } as never)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/raffles error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al crear rifa', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

// PATCH - Update a raffle
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      throw new AppError('ID de rifa requerido', ErrorCodes.VALIDATION_ERROR, 400)
    }

    const { data, error } = await supabase
      .from('raffles')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('PATCH /api/raffles error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al actualizar rifa', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

// DELETE - Delete a raffle
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      throw new AppError('ID de rifa requerido', ErrorCodes.VALIDATION_ERROR, 400)
    }

    const { error } = await supabase
      .from('raffles')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/raffles error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al eliminar rifa', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
