'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Shield, 
  ShieldCheck, 
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Crown,
  Wallet,
  FileText,
  Eye,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks'

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

const roles = [
  { value: 'admin', label: 'Administrador', icon: Crown, color: 'bg-red-100 text-red-800', description: 'Acceso total al sistema' },
  { value: 'treasurer', label: 'Tesorero', icon: Wallet, color: 'bg-green-100 text-green-800', description: 'Gestión financiera' },
  { value: 'secretary', label: 'Secretario', icon: FileText, color: 'bg-blue-100 text-blue-800', description: 'Documentación y actas' },
  { value: 'vocal', label: 'Vocal', icon: Star, color: 'bg-purple-100 text-purple-800', description: 'Eventos y actividades' },
  { value: 'viewer', label: 'Solo Lectura', icon: Eye, color: 'bg-gray-100 text-gray-800', description: 'Ver información' },
]

export default function UsersManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // State
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    userId: string
    action: 'role' | 'status'
    newValue: string | boolean
    userName: string
  } | null>(null)

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users')
      if (response.status === 403) {
        toast({
          title: 'Acceso denegado',
          description: 'Solo administradores pueden acceder a esta página',
          variant: 'destructive'
        })
        router.push('/dashboard')
        return
      }
      if (!response.ok) throw new Error('Error al cargar usuarios')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [router, toast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Filter users
  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Update user
  const updateUser = async (id: string, updates: { role?: string; is_active?: boolean }) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      
      if (!response.ok) throw new Error('Error al actualizar usuario')
      
      const updatedUser = await response.json()
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u))
      
      toast({
        title: 'Usuario actualizado',
        description: 'Los cambios se guardaron correctamente'
      })
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el usuario',
        variant: 'destructive'
      })
    }
  }

  // Handle role change
  const handleRoleChange = (userId: string, newRole: string, userName: string) => {
    setConfirmDialog({
      open: true,
      userId,
      action: 'role',
      newValue: newRole,
      userName
    })
  }

  // Handle status toggle
  const handleStatusToggle = (userId: string, currentStatus: boolean, userName: string) => {
    setConfirmDialog({
      open: true,
      userId,
      action: 'status',
      newValue: !currentStatus,
      userName
    })
  }

  // Confirm action
  const confirmAction = async () => {
    if (!confirmDialog) return
    
    if (confirmDialog.action === 'role') {
      await updateUser(confirmDialog.userId, { role: confirmDialog.newValue as string })
    } else {
      await updateUser(confirmDialog.userId, { is_active: confirmDialog.newValue as boolean })
    }
    
    setConfirmDialog(null)
  }

  // Get role info
  const getRoleInfo = (role: string) => {
    return roles.find(r => r.value === role) || roles[4] // default to viewer
  }

  // Get initials
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  // Stats
  const adminCount = users.filter(u => u.role === 'admin').length
  const activeCount = users.filter(u => u.is_active).length
  const totalCount = users.length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-orange-500" />
            Administración de Usuarios
          </h1>
          <p className="text-muted-foreground">
            Gestiona los roles y permisos de los miembros del equipo
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Administradores
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{adminCount}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuarios Activos
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Roles Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Roles del Sistema</CardTitle>
          <CardDescription>Cada rol tiene diferentes niveles de acceso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {roles.map(role => {
              const Icon = role.icon
              return (
                <div key={role.value} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <Icon className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">{role.label}</p>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuarios Registrados</CardTitle>
              <CardDescription>{filteredUsers.length} usuarios encontrados</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario..."
                className="pl-10 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const roleInfo = getRoleInfo(user.role)
                  const RoleIcon = roleInfo.icon
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-orange-100 text-orange-700">
                              {getInitials(user.full_name, user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name || 'Sin nombre'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{user.phone || 'No registrado'}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleInfo.color}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.is_active ? (
                          <Badge className="bg-green-100 text-green-800">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <UserX className="h-3 w-3 mr-1" />
                            Inactivo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('es-MX')}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value, user.full_name || user.email)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map(role => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusToggle(user.id, user.is_active, user.full_name || user.email)}
                            className={user.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                          >
                            {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.action === 'role' ? 'Cambiar Rol' : 'Cambiar Estado'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.action === 'role' ? (
                <>
                  ¿Estás seguro de cambiar el rol de <strong>{confirmDialog.userName}</strong> a{' '}
                  <strong>{roles.find(r => r.value === confirmDialog.newValue)?.label}</strong>?
                </>
              ) : (
                <>
                  ¿Estás seguro de {confirmDialog?.newValue ? 'activar' : 'desactivar'} a{' '}
                  <strong>{confirmDialog?.userName}</strong>?
                  {!confirmDialog?.newValue && (
                    <span className="block mt-2 text-red-600">
                      El usuario no podrá acceder al sistema.
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
