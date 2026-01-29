import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AppError, formatErrorResponse, ErrorCodes } from '@/lib/error-handler'
import type { Raffle, RaffleTicket } from '@/types/database.types'

// GET - Get raffle tickets
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get raffle
    const { data: raffleData, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', id)
      .single()

    if (raffleError) throw new AppError('Rifa no encontrada', ErrorCodes.DB_NOT_FOUND, 404)

    const raffle = raffleData as Raffle

    // Get tickets
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('raffle_tickets')
      .select('*')
      .eq('raffle_id', id)
      .order('ticket_number', { ascending: true })

    if (ticketsError) throw ticketsError

    const tickets = (ticketsData || []) as RaffleTicket[]

    return NextResponse.json({
      success: true,
      data: {
        raffle,
        tickets,
        stats: {
          sold: tickets.length,
          available: raffle.total_tickets - tickets.length,
          revenue: tickets.filter(t => t.payment_status === 'paid').length * raffle.ticket_price,
        },
      },
    })
  } catch (error) {
    console.error('GET /api/raffles/[id]/tickets error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al obtener boletos', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

// POST - Sell ticket(s)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    // Check if raffle exists and is active
    const { data: raffleData, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', id)
      .single()

    if (raffleError) throw new AppError('Rifa no encontrada', ErrorCodes.DB_NOT_FOUND, 404)
    
    const raffle = raffleData as Raffle
    if (raffle.status !== 'active') throw new AppError('Esta rifa no está activa', ErrorCodes.RAFFLE_CLOSED, 400)

    // Handle single or multiple tickets
    const ticketNumbers = Array.isArray(body.ticket_numbers) 
      ? body.ticket_numbers 
      : [body.ticket_number]

    // Check if tickets are available
    const { data: existingData } = await supabase
      .from('raffle_tickets')
      .select('ticket_number')
      .eq('raffle_id', id)
      .in('ticket_number', ticketNumbers)

    const existingTickets = (existingData || []) as Pick<RaffleTicket, 'ticket_number'>[]
    
    if (existingTickets.length > 0) {
      const soldNumbers = existingTickets.map(t => t.ticket_number).join(', ')
      throw new AppError(`Los boletos ${soldNumbers} ya han sido vendidos`, ErrorCodes.TICKET_ALREADY_SOLD, 400)
    }

    // Validate ticket numbers
    for (const num of ticketNumbers) {
      if (num < 1 || num > raffle.total_tickets) {
        throw new AppError(`Número de boleto ${num} inválido`, ErrorCodes.VALIDATION_ERROR, 400)
      }
    }

    // Create tickets
    const ticketsToInsert = ticketNumbers.map((num: number) => ({
      raffle_id: id,
      ticket_number: num,
      buyer_name: body.buyer_name,
      buyer_phone: body.buyer_phone,
      buyer_email: body.buyer_email,
      sold_by: body.sold_by,
      sale_date: new Date().toISOString().split('T')[0],
      payment_status: body.payment_status || 'paid',
    }))

    const { data, error } = await supabase
      .from('raffle_tickets')
      .insert(ticketsToInsert as never[])
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/raffles/[id]/tickets error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al vender boleto', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
