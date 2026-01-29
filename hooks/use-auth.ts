'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: 'admin' | 'treasurer' | 'president' | 'secretary' | 'viewer'
  avatar_url: string | null
  is_active: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  })
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data as UserProfile)
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }, [supabase])

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        setState({
          user: session?.user ?? null,
          isLoading: false,
          error: null,
        })

        if (session?.user) {
          fetchProfile(session.user.id)
        }
      } catch (err) {
        setState({
          user: null,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Error de autenticación',
        })
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState({
          user: session?.user ?? null,
          isLoading: false,
          error: null,
        })

        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setState({
        user: data.user,
        isLoading: false,
        error: null,
      })

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      return { success: false, error: errorMessage }
    }
  }

  const signOut = async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setState({
        user: null,
        isLoading: false,
        error: null,
      })
      setProfile(null)
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cerrar sesión'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      return { success: false, error: errorMessage }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) throw error
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar email'
      return { success: false, error: errorMessage }
    }
  }

  const hasRole = (roles: UserProfile['role'][]) => {
    if (!profile) return false
    return roles.includes(profile.role)
  }

  const isAdmin = () => hasRole(['admin'])
  const isTreasurer = () => hasRole(['admin', 'treasurer'])
  const canManageFinances = () => hasRole(['admin', 'treasurer'])
  const canApproveExpenses = () => hasRole(['admin', 'treasurer', 'president'])
  const canManageEvents = () => hasRole(['admin', 'treasurer', 'secretary'])

  return {
    user: state.user,
    profile,
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated: !!state.user,
    signIn,
    signOut,
    resetPassword,
    hasRole,
    isAdmin,
    isTreasurer,
    canManageFinances,
    canApproveExpenses,
    canManageEvents,
  }
}
