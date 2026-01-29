import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AppError, formatErrorResponse, ErrorCodes } from '@/lib/error-handler'
import type { Database, Transaction } from '@/types/database.types'

type TransactionWithCategory = Transaction & {
  categories?: { name: string; color: string | null } | null
}

// GET - Get monthly report or generate one
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString()) + 1
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    // Try to get existing report
    const { data: existingReport } = await supabase
      .from('monthly_reports')
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .single()

    if (existingReport) {
      return NextResponse.json({ success: true, data: existingReport })
    }

    // Generate report from transactions
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    // Get transactions for the month
    const { data: transactionsData, error: transError } = await supabase
      .from('transactions')
      .select('*, categories(name, color)')
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('status', 'approved')

    if (transError) throw transError

    const transactions = (transactionsData || []) as TransactionWithCategory[]
    const income = transactions.filter(t => t.type === 'income')
    const expense = transactions.filter(t => t.type === 'expense')

    const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0)
    const totalExpense = expense.reduce((sum, t) => sum + Number(t.amount), 0)
    const balance = totalIncome - totalExpense

    // Group by category
    const incomeByCategory = income.reduce((acc, t) => {
      const cat = t.categories?.name || 'Sin categoría'
      acc[cat] = (acc[cat] || 0) + Number(t.amount)
      return acc
    }, {} as Record<string, number>)

    const expenseByCategory = expense.reduce((acc, t) => {
      const cat = t.categories?.name || 'Sin categoría'
      acc[cat] = (acc[cat] || 0) + Number(t.amount)
      return acc
    }, {} as Record<string, number>)

    const reportData = {
      month,
      year,
      total_income: totalIncome,
      total_expense: totalExpense,
      balance,
      report_data: {
        income_by_category: incomeByCategory,
        expense_by_category: expenseByCategory,
        transaction_count: transactions.length,
        income_count: income.length,
        expense_count: expense.length,
      },
      generated_at: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, data: reportData })
  } catch (error) {
    console.error('GET /api/reports error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al obtener reporte', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

// POST - Save monthly report
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { month, year, total_income, total_expense, balance, report_data, generated_by } = body

    if (!month || !year) {
      throw new AppError('Mes y año requeridos', ErrorCodes.VALIDATION_ERROR, 400)
    }

    // Upsert report
    const { data, error } = await supabase
      .from('monthly_reports')
      .upsert({
        month,
        year,
        total_income,
        total_expense,
        balance,
        report_data,
        generated_by,
        generated_at: new Date().toISOString(),
      } as never, {
        onConflict: 'month,year',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/reports error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al guardar reporte', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
