'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Raffle = Database['public']['Tables']['raffles']['Row']
type RaffleInsert = Database['public']['Tables']['raffles']['Insert']
type RaffleUpdate = Database['public']['Tables']['raffles']['Update']
type RaffleTicket = Database['public']['Tables']['raffle_tickets']['Row']
type RaffleTicketInsert = Database['public']['Tables']['raffle_tickets']['Insert']

interface RaffleFilters {
  status?: 'active' | 'closed' | 'drawn'
  search?: string
}

interface UseRafflesOptions {
  filters?: RaffleFilters
  limit?: number
}

export function useRaffles(options: UseRafflesOptions = {}) {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const { filters = {}, limit = 50 } = options

  const fetchRaffles = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setRaffles((data as Raffle[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar rifas')
      setRaffles([])
    } finally {
      setIsLoading(false)
    }
  }, [supabase, filters, limit])

  useEffect(() => {
    fetchRaffles()
  }, [fetchRaffles])

  const createRaffle = async (data: RaffleInsert) => {
    try {
      const { data: newRaffle, error } = await supabase
        .from('raffles')
        .insert(data as never)
        .select()
        .single()

      if (error) throw error

      setRaffles(prev => [newRaffle as Raffle, ...prev])
      return { success: true, data: newRaffle }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear rifa'
      return { success: false, error: errorMessage }
    }
  }

  const updateRaffle = async (id: string, data: RaffleUpdate) => {
    try {
      const { data: updated, error } = await supabase
        .from('raffles')
        .update(data as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setRaffles(prev => prev.map(r => r.id === id ? (updated as Raffle) : r))
      return { success: true, data: updated }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar rifa'
      return { success: false, error: errorMessage }
    }
  }

  const deleteRaffle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('raffles')
        .delete()
        .eq('id', id)

      if (error) throw error

      setRaffles(prev => prev.filter(r => r.id !== id))
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar rifa'
      return { success: false, error: errorMessage }
    }
  }

  const closeRaffle = async (id: string) => {
    return updateRaffle(id, { status: 'closed' })
  }

  // Calculate stats
  const activeRaffles = raffles.filter(r => r.status === 'active')
  const totalRaffles = raffles.length

  return {
    raffles,
    isLoading,
    error,
    activeRaffles,
    totalRaffles,
    refetch: fetchRaffles,
    createRaffle,
    updateRaffle,
    deleteRaffle,
    closeRaffle,
  }
}

// Hook for a single raffle with tickets
export function useRaffle(id: string) {
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [tickets, setTickets] = useState<RaffleTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchRaffle = useCallback(async () => {
    if (!id) return

    setIsLoading(true)
    try {
      // Fetch raffle
      const { data: raffleData, error: raffleError } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', id)
        .single()

      if (raffleError) throw raffleError
      setRaffle(raffleData)

      // Fetch tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('raffle_tickets')
        .select('*')
        .eq('raffle_id', id)
        .order('ticket_number', { ascending: true })

      if (ticketsError) throw ticketsError
      setTickets(ticketsData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar rifa')
    } finally {
      setIsLoading(false)
    }
  }, [id, supabase])

  useEffect(() => {
    fetchRaffle()
  }, [fetchRaffle])

  const sellTicket = async (data: Omit<RaffleTicketInsert, 'raffle_id'>) => {
    try {
      const { data: newTicket, error } = await supabase
        .from('raffle_tickets')
        .insert({ ...data, raffle_id: id } as never)
        .select()
        .single()

      if (error) throw error

      setTickets(prev => [...prev, newTicket as RaffleTicket].sort((a, b) => a.ticket_number - b.ticket_number))
      return { success: true, data: newTicket }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al vender boleto'
      return { success: false, error: errorMessage }
    }
  }

  const sellMultipleTickets = async (tickets: Omit<RaffleTicketInsert, 'raffle_id'>[]) => {
    try {
      const ticketsWithRaffle = tickets.map(t => ({ ...t, raffle_id: id }))
      
      const { data: newTickets, error } = await supabase
        .from('raffle_tickets')
        .insert(ticketsWithRaffle as never[])
        .select()

      if (error) throw error

      setTickets(prev => 
        [...prev, ...((newTickets as RaffleTicket[]) || [])].sort((a, b) => a.ticket_number - b.ticket_number)
      )
      return { success: true, data: newTickets }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al vender boletos'
      return { success: false, error: errorMessage }
    }
  }

  const performDraw = async () => {
    if (!raffle || tickets.length === 0) {
      return { success: false, error: 'No hay boletos vendidos' }
    }

    try {
      // Select random winner
      const randomIndex = Math.floor(Math.random() * tickets.length)
      const winnerTicket = tickets[randomIndex]

      const { data: updated, error } = await supabase
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

      setRaffle(updated as Raffle)
      return { success: true, winner: winnerTicket }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al realizar sorteo'
      return { success: false, error: errorMessage }
    }
  }

  // Calculate stats
  const soldTickets = tickets.length
  const availableTickets = raffle ? raffle.total_tickets - soldTickets : 0
  const totalRevenue = raffle ? soldTickets * Number(raffle.ticket_price) : 0
  const soldNumbers = new Set(tickets.map(t => t.ticket_number))

  const getAvailableNumbers = () => {
    if (!raffle) return []
    const available: number[] = []
    for (let i = 1; i <= raffle.total_tickets; i++) {
      if (!soldNumbers.has(i)) {
        available.push(i)
      }
    }
    return available
  }

  return {
    raffle,
    tickets,
    isLoading,
    error,
    soldTickets,
    availableTickets,
    totalRevenue,
    refetch: fetchRaffle,
    sellTicket,
    sellMultipleTickets,
    performDraw,
    getAvailableNumbers,
  }
}
