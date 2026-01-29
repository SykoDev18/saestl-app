import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AppError, formatErrorResponse, ErrorCodes } from '@/lib/error-handler'

// GET - List all transactions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const type = searchParams.get('type')
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('transactions')
      .select('*, categories(id, name, color)', { count: 'exact' })

    // Apply filters
    if (type) query = query.eq('type', type)
    if (categoryId) query = query.eq('category_id', categoryId)
    if (status) query = query.eq('status', status)
    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    if (search) query = query.ilike('description', `%${search}%`)

    // Pagination and ordering
    query = query
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('GET /api/transactions error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al obtener transacciones', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

// POST - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate required fields
    const { type, amount, description, date, category_id, created_by } = body
    
    if (!type || !amount || !description || !date) {
      throw new AppError('Faltan campos requeridos', ErrorCodes.VALIDATION_ERROR, 400)
    }

    if (!['income', 'expense'].includes(type)) {
      throw new AppError('Tipo de transacción inválido', ErrorCodes.VALIDATION_ERROR, 400)
    }

    if (amount <= 0) {
      throw new AppError('El monto debe ser mayor a 0', ErrorCodes.VALIDATION_ERROR, 400)
    }

    // Create transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type,
        amount,
        description,
        date,
        category_id,
        created_by,
        status: 'pending',
        payment_method: body.payment_method || 'cash',
        notes: body.notes,
        receipt_url: body.receipt_url,
      } as never)
      .select('*, categories(id, name, color)')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/transactions error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al crear transacción', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

// PATCH - Update a transaction
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      throw new AppError('ID de transacción requerido', ErrorCodes.VALIDATION_ERROR, 400)
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updates as never)
      .eq('id', id)
      .select('*, categories(id, name, color)')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('PATCH /api/transactions error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al actualizar transacción', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

// DELETE - Delete a transaction
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      throw new AppError('ID de transacción requerido', ErrorCodes.VALIDATION_ERROR, 400)
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/transactions error:', error)
    const appError = error instanceof AppError 
      ? error 
      : new AppError('Error al eliminar transacción', ErrorCodes.DB_QUERY_ERROR)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
