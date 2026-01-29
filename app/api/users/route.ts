import { NextRequest, NextResponse } from 'next/server'
import { createUntypedClient } from '@/lib/supabase/server'

interface User {
  id: string
  email: string
  full_name: string | null
  role: string
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// GET /api/users - Get all users (admin only)
export async function GET() {
  try {
    const supabase = await createUntypedClient()
    
    // Check if current user is admin
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('email', authUser.email)
      .single()

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden ver usuarios' }, { status: 403 })
    }

    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
    }

    return NextResponse.json(users as User[])
  } catch (error) {
    console.error('Users GET error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PATCH /api/users - Update user role or status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createUntypedClient()
    
    // Check if current user is admin
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('email', authUser.email)
      .single()

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden modificar usuarios' }, { status: 403 })
    }

    const body = await request.json()
    const { id, role, is_active } = body

    if (!id) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 })
    }

    // Build update object
    const updateData: { role?: string; is_active?: boolean; updated_at: string } = {
      updated_at: new Date().toISOString()
    }

    if (role !== undefined) {
      const validRoles = ['admin', 'treasurer', 'secretary', 'vocal', 'viewer']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
      }
      updateData.role = role
    }

    if (is_active !== undefined) {
      updateData.is_active = is_active
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
    }

    return NextResponse.json(updatedUser as User)
  } catch (error) {
    console.error('Users PATCH error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
