'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Transaction = Database['public']['Tables']['transactions']['Row']
type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

interface TransactionFilters {
  type?: 'income' | 'expense'
  categoryId?: string
  status?: 'pending' | 'approved' | 'rejected'
  startDate?: string
  endDate?: string
  search?: string
}

interface UseTransactionsOptions {
  filters?: TransactionFilters
  limit?: number
  orderBy?: keyof Transaction
  orderDirection?: 'asc' | 'desc'
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const supabase = createClient()
  const { 
    filters = {}, 
    limit = 50, 
    orderBy = 'date', 
    orderDirection = 'desc' 
  } = options

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('transactions')
        .select('*, categories(name, color)', { count: 'exact' })

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.startDate) {
        query = query.gte('date', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate)
      }
      if (filters.search) {
        query = query.ilike('description', `%${filters.search}%`)
      }

      // Order and limit
      query = query
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .limit(limit)

      const { data, error: fetchError, count } = await query

      if (fetchError) throw fetchError

      setTransactions((data as Transaction[]) || [])
      setTotalCount(count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar transacciones')
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }, [supabase, filters, limit, orderBy, orderDirection])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const createTransaction = async (data: TransactionInsert) => {
    try {
      const { data: newTransaction, error } = await supabase
        .from('transactions')
        .insert(data as never)
        .select()
        .single()

      if (error) throw error

      setTransactions(prev => [newTransaction as Transaction, ...prev])
      return { success: true, data: newTransaction }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear transacción'
      return { success: false, error: errorMessage }
    }
  }

  const updateTransaction = async (id: string, data: TransactionUpdate) => {
    try {
      const { data: updated, error } = await supabase
        .from('transactions')
        .update(data as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setTransactions(prev => 
        prev.map(t => t.id === id ? (updated as Transaction) : t)
      )
      return { success: true, data: updated }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar transacción'
      return { success: false, error: errorMessage }
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTransactions(prev => prev.filter(t => t.id !== id))
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar transacción'
      return { success: false, error: errorMessage }
    }
  }

  const approveTransaction = async (id: string, approvedBy: string) => {
    return updateTransaction(id, { 
      status: 'approved', 
      approved_by: approvedBy 
    })
  }

  const rejectTransaction = async (id: string) => {
    return updateTransaction(id, { status: 'rejected' })
  }

  // Calculate summaries
  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'approved')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense' && t.status === 'approved')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const balance = totalIncome - totalExpense

  return {
    transactions,
    isLoading,
    error,
    totalCount,
    totalIncome,
    totalExpense,
    balance,
    refetch: fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    approveTransaction,
    rejectTransaction,
  }
}

// Hook for getting a single transaction
export function useTransaction(id: string) {
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id) return

      setIsLoading(true)
      try {
        const { data, error: fetchError } = await supabase
          .from('transactions')
          .select('*, categories(name, color)')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError
        setTransaction(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar transacción')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransaction()
  }, [id, supabase])

  return { transaction, isLoading, error }
}
