import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AppError, formatErrorResponse, ErrorCodes } from '@/lib/error-handler'
import type { Raffle, RaffleTicket } from '@/types/database.types'

// POST - Perform raffle draw
export async function POST(
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
    if (raffle.status === 'drawn') throw new AppError('Esta rifa ya fue sorteada', ErrorCodes.RAFFLE_CLOSED, 400)

    // Get all tickets
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('raffle_tickets')
      .select('*')
      .eq('raffle_id', id)

    if (ticketsError) throw ticketsError
    
    const tickets = (ticketsData || []) as RaffleTicket[]
    if (tickets.length === 0) {
      throw new AppError('No hay boletos vendidos para sortear', ErrorCodes.VALIDATION_ERROR, 400)
    }

    // Select random winner
    const randomIndex = Math.floor(Math.random() * tickets.length)
    const winnerTicket = tickets[randomIndex]

    // Update raffle with winner
    const { data, error } = await supabase
      .from('raffles')
      .update({
        status: 'drawn',
        winner_ticket_number: winnerTicket.ticket_number,
        winner_name: winnerTicket.buyer_name,
        winner_phone: winnerTicket.buyer_phone,
        draw_date: new Date().toISOString().split('T')[0],
      } as never)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: {
        raffle: data,
        winner: winnerTicket,
      },
    })
  } catch (error) {
    console.error('POST /api/raffles/[id]/draw error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al realizar sorteo', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
