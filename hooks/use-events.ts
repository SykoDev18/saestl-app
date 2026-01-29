'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Event = Database['public']['Tables']['events']['Row']
type EventInsert = Database['public']['Tables']['events']['Insert']
type EventUpdate = Database['public']['Tables']['events']['Update']
type EventRegistration = Database['public']['Tables']['event_registrations']['Row']
type EventRegistrationInsert = Database['public']['Tables']['event_registrations']['Insert']

interface EventFilters {
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  eventType?: string
  search?: string
}

interface UseEventsOptions {
  filters?: EventFilters
  limit?: number
}

export function useEvents(options: UseEventsOptions = {}) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const { filters = {}, limit = 50 } = options

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
        .limit(limit)

      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType)
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setEvents(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos')
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [supabase, filters, limit])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const createEvent = async (data: EventInsert) => {
    try {
      const { data: newEvent, error } = await supabase
        .from('events')
        .insert(data as never)
        .select()
        .single()

      if (error) throw error

      setEvents(prev => [...prev, newEvent as Event].sort((a, b) => 
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      ))
      return { success: true, data: newEvent }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear evento'
      return { success: false, error: errorMessage }
    }
  }

  const updateEvent = async (id: string, data: EventUpdate) => {
    try {
      const { data: updated, error } = await supabase
        .from('events')
        .update(data as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setEvents(prev => prev.map(e => e.id === id ? (updated as Event) : e))
      return { success: true, data: updated }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar evento'
      return { success: false, error: errorMessage }
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error

      setEvents(prev => prev.filter(e => e.id !== id))
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar evento'
      return { success: false, error: errorMessage }
    }
  }

  const cancelEvent = async (id: string) => {
    return updateEvent(id, { status: 'cancelled' })
  }

  // Calculate stats
  const upcomingEvents = events.filter(e => e.status === 'upcoming')
  const ongoingEvents = events.filter(e => e.status === 'ongoing')
  const totalEvents = events.length

  return {
    events,
    isLoading,
    error,
    upcomingEvents,
    ongoingEvents,
    totalEvents,
    refetch: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    cancelEvent,
  }
}

// Hook for a single event with registrations
export function useEvent(id: string) {
  const [event, setEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchEvent = useCallback(async () => {
    if (!id) return

    setIsLoading(true)
    try {
      // Fetch event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

      if (eventError) throw eventError
      setEvent(eventData)

      // Fetch registrations
      const { data: regData, error: regError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', id)
        .order('registration_date', { ascending: false })

      if (regError) throw regError
      setRegistrations(regData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar evento')
    } finally {
      setIsLoading(false)
    }
  }, [id, supabase])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  const registerParticipant = async (data: Omit<EventRegistrationInsert, 'event_id'>) => {
    try {
      const { data: newReg, error } = await supabase
        .from('event_registrations')
        .insert({ ...data, event_id: id } as never)
        .select()
        .single()

      if (error) throw error

      setRegistrations(prev => [newReg as EventRegistration, ...prev])
      return { success: true, data: newReg }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar participante'
      return { success: false, error: errorMessage }
    }
  }

  const updateRegistration = async (regId: string, data: Partial<EventRegistration>) => {
    try {
      const { data: updated, error } = await supabase
        .from('event_registrations')
        .update(data as never)
        .eq('id', regId)
        .select()
        .single()

      if (error) throw error

      setRegistrations(prev => prev.map(r => r.id === regId ? (updated as EventRegistration) : r))
      return { success: true, data: updated }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar registro'
      return { success: false, error: errorMessage }
    }
  }

  const markAttendance = async (regId: string, status: 'attended' | 'absent') => {
    return updateRegistration(regId, { attendance_status: status })
  }

  const updatePaymentStatus = async (regId: string, status: 'paid' | 'pending') => {
    return updateRegistration(regId, { payment_status: status })
  }

  // Calculate stats
  const totalRegistrations = registrations.length
  const attendedCount = registrations.filter(r => r.attendance_status === 'attended').length
  const paidCount = registrations.filter(r => r.payment_status === 'paid').length
  const pendingPayments = registrations.filter(r => r.payment_status === 'pending').length
  const availableSpots = event ? (event.max_capacity || 0) - totalRegistrations : 0
  const totalRevenue = event ? paidCount * Number(event.ticket_price || 0) : 0

  return {
    event,
    registrations,
    isLoading,
    error,
    totalRegistrations,
    attendedCount,
    paidCount,
    pendingPayments,
    availableSpots,
    totalRevenue,
    refetch: fetchEvent,
    registerParticipant,
    updateRegistration,
    markAttendance,
    updatePaymentStatus,
  }
}
