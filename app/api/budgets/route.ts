import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AppError, formatErrorResponse, ErrorCodes } from '@/lib/error-handler'
import type { Budget } from '@/types/database.types'

// GET - List all budgets
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const categoryId = searchParams.get('categoryId')
    const year = searchParams.get('year')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('budgets')
      .select('*, categories(id, name, color)', { count: 'exact' })

    if (categoryId) query = query.eq('category_id', categoryId)
    if (year) {
      query = query.gte('period_start', `${year}-01-01`).lte('period_end', `${year}-12-31`)
    }

    query = query
      .order('period_start', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    const budgets = (data || []) as Budget[]

    // Calculate spent amount for each budget
    const budgetsWithSpent = await Promise.all(budgets.map(async (budget) => {
      let spent = 0
      
      if (budget.category_id) {
        const { data: transactionsData } = await supabase
          .from('transactions')
          .select('amount')
          .eq('category_id', budget.category_id)
          .eq('type', 'expense')
          .eq('status', 'approved')
          .gte('date', budget.period_start)
          .lte('date', budget.period_end)

        const transactions = (transactionsData || []) as { amount: number }[]
        spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0)
      }
      
      return {
        ...budget,
        spent,
        remaining: Number(budget.amount) - spent,
        percentage: (spent / Number(budget.amount)) * 100,
      }
    }))

    return NextResponse.json({
      success: true,
      data: budgetsWithSpent,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('GET /api/budgets error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al obtener presupuestos', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

// POST - Create a new budget
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { name, amount, category_id, period_start, period_end, created_by } = body
    
    if (!name || !amount || !period_start || !period_end) {
      throw new AppError('Faltan campos requeridos', ErrorCodes.VALIDATION_ERROR, 400)
    }

    if (amount <= 0) {
      throw new AppError('El monto debe ser mayor a 0', ErrorCodes.VALIDATION_ERROR, 400)
    }

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        name,
        amount,
        category_id,
        period_start,
        period_end,
        created_by,
        description: body.description,
      } as never)
      .select('*, categories(id, name, color)')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/budgets error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al crear presupuesto', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

// PATCH - Update a budget
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      throw new AppError('ID de presupuesto requerido', ErrorCodes.VALIDATION_ERROR, 400)
    }

    const { data, error } = await supabase
      .from('budgets')
      .update(updates as never)
      .eq('id', id)
      .select('*, categories(id, name, color)')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('PATCH /api/budgets error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al actualizar presupuesto', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

// DELETE - Delete a budget
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      throw new AppError('ID de presupuesto requerido', ErrorCodes.VALIDATION_ERROR, 400)
    }

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/budgets error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al eliminar presupuesto', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
