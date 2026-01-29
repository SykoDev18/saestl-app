'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { User, Mail, Shield, Calendar, Loader2, Save, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const profileSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  avatar_url: z.string().url('URL inválida').optional().or(z.literal('')),
})

type ProfileInput = z.infer<typeof profileSchema>

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  treasurer: 'Tesorero',
  president: 'Presidente',
  secretary: 'Secretario',
  viewer: 'Solo lectura',
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-800',
  treasurer: 'bg-blue-100 text-blue-800',
  president: 'bg-purple-100 text-purple-800',
  secretary: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState('viewer')
  const [createdAt, setCreatedAt] = useState<string | null>(null)
  const supabase = createClient()

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      avatar_url: '',
    },
  })

  const loadUserProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user && user.email) {
        setUserEmail(user.email)
        
        // Buscar perfil en la tabla users
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single()

        if (profile) {
          const p = profile as { full_name?: string; phone?: string; avatar_url?: string; role?: string; created_at?: string }
          form.reset({
            full_name: p.full_name || '',
            phone: p.phone || '',
            avatar_url: p.avatar_url || '',
          })
          setUserRole(p.role || 'viewer')
          setCreatedAt(p.created_at || null)
        } else {
          // Si no existe perfil, usar datos del auth
          form.reset({
            full_name: user.user_metadata?.full_name || '',
            phone: '',
            avatar_url: '',
          })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Error al cargar el perfil')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, form])

  useEffect(() => {
    loadUserProfile()
  }, [loadUserProfile])

  const onSubmit = async (data: ProfileInput) => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !user.email) {
        toast.error('No hay sesión activa')
        return
      }

      const userEmail = user.email

      // Verificar si existe el usuario en la tabla
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single()

      if (existingUser) {
        // Actualizar usuario existente
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('users')
          .update({
            full_name: data.full_name,
            phone: data.phone || null,
            avatar_url: data.avatar_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq('email', userEmail)

        if (error) throw error
      } else {
        // Crear nuevo usuario
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('users')
          .insert({
            email: userEmail,
            full_name: data.full_name,
            phone: data.phone || null,
            avatar_url: data.avatar_url || null,
            role: 'viewer',
          })

        if (error) throw error
      }

      toast.success('Perfil actualizado correctamente')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error al actualizar el perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-500">
          Administra tu información personal y preferencias
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={form.watch('avatar_url')} />
              <AvatarFallback className="text-xl bg-blue-100 text-blue-700">
                {getInitials(form.watch('full_name') || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl">
                {form.watch('full_name') || 'Usuario'}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {userEmail}
              </CardDescription>
              <div className="mt-2">
                <Badge className={ROLE_COLORS[userRole]}>
                  <Shield className="w-3 h-3 mr-1" />
                  {ROLE_LABELS[userRole] || userRole}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Información Personal
          </CardTitle>
          <CardDescription>
            Actualiza tu información de perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tu nombre completo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="771 123 4567"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Opcional - Para contacto de emergencia
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Avatar</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          placeholder="https://ejemplo.com/mi-foto.jpg"
                          {...field}
                        />
                        <Button type="button" variant="outline" size="icon">
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      URL de una imagen para tu perfil
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Read-only Information */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">
                    Correo electrónico
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{userEmail}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    El correo no se puede cambiar
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">
                    Rol en el sistema
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{ROLE_LABELS[userRole]}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Solo un administrador puede cambiar tu rol
                  </p>
                </div>
              </div>

              {createdAt && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Miembro desde: {new Date(createdAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
