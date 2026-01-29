'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Bell, 
  Shield, 
  Palette,
  Lock,
  Loader2,
  Save,
  LogOut,
  Eye,
  EyeOff,
  Check,
  Database,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Mínimo 6 caracteres'),
  newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type PasswordInput = z.infer<typeof passwordSchema>

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
  is_active: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [userRole, setUserRole] = useState('viewer')
  const supabase = createClient()

  // Notification preferences (local state for demo)
  const [notifications, setNotifications] = useState({
    emailTransactions: true,
    emailReports: true,
    emailEvents: false,
    pushEnabled: false,
  })

  const passwordForm = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    loadUserRole()
    loadCategories()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.email) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single()
      
      if (profile) {
        const p = profile as { role?: string }
        setUserRole(p.role || 'viewer')
      }
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('type', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const onPasswordChange = async (data: PasswordInput) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (error) {
        if (error.message.includes('same')) {
          toast.error('La nueva contraseña debe ser diferente a la actual')
        } else {
          toast.error('Error al cambiar la contraseña', {
            description: error.message,
          })
        }
        return
      }

      toast.success('Contraseña actualizada correctamente')
      passwordForm.reset()
    } catch {
      toast.error('Error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    toast.success('Sesión cerrada')
  }

  const isAdmin = userRole === 'admin' || userRole === 'treasurer'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500">
          Administra tu cuenta y preferencias del sistema
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="security" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="categories" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Categorías</span>
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="system" className="gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Sistema</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Cambiar Contraseña
              </CardTitle>
              <CardDescription>
                Actualiza tu contraseña para mantener tu cuenta segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordChange)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña actual</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showCurrentPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Mínimo 6 caracteres
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar nueva contraseña</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Cambiar contraseña
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Session Management */}
          <Card>
            <CardHeader>
              <CardTitle>Sesión Activa</CardTitle>
              <CardDescription>
                Administra tu sesión actual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Sesión actual</p>
                    <p className="text-sm text-gray-500">Este dispositivo</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Activa
                </Badge>
              </div>

              <Separator />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tendrás que volver a iniciar sesión con tu correo institucional.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSignOut}>
                      Cerrar sesión
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Preferencias de Notificaciones
              </CardTitle>
              <CardDescription>
                Configura cómo y cuándo quieres recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Notificaciones por correo</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="font-medium text-sm">Transacciones</label>
                    <p className="text-sm text-gray-500">
                      Recibe un correo cuando se registre una transacción
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailTransactions}
                    onCheckedChange={(checked: boolean) => 
                      setNotifications(prev => ({ ...prev, emailTransactions: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="font-medium text-sm">Reportes mensuales</label>
                    <p className="text-sm text-gray-500">
                      Recibe un resumen financiero cada mes
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailReports}
                    onCheckedChange={(checked: boolean) => 
                      setNotifications(prev => ({ ...prev, emailReports: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="font-medium text-sm">Eventos próximos</label>
                    <p className="text-sm text-gray-500">
                      Recordatorios de eventos programados
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailEvents}
                    onCheckedChange={(checked: boolean) => 
                      setNotifications(prev => ({ ...prev, emailEvents: checked }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notificaciones push</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="font-medium text-sm">Habilitar notificaciones push</label>
                    <p className="text-sm text-gray-500">
                      Recibe notificaciones en tiempo real en tu navegador
                    </p>
                  </div>
                  <Switch
                    checked={notifications.pushEnabled}
                    onCheckedChange={(checked: boolean) => 
                      setNotifications(prev => ({ ...prev, pushEnabled: checked }))
                    }
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={() => toast.success('Preferencias guardadas')}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar preferencias
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab (Admin only) */}
        {isAdmin && (
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Categorías del Sistema
                </CardTitle>
                <CardDescription>
                  Administra las categorías de ingresos y egresos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCategories ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Income Categories */}
                    <div>
                      <h4 className="font-medium text-green-700 mb-3">
                        Categorías de Ingreso
                      </h4>
                      <div className="grid gap-2">
                        {categories
                          .filter(c => c.type === 'income')
                          .map(category => (
                            <div 
                              key={category.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span>{category.name}</span>
                              </div>
                              <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                {category.is_active ? 'Activa' : 'Inactiva'}
                              </Badge>
                            </div>
                          ))
                        }
                      </div>
                    </div>

                    <Separator />

                    {/* Expense Categories */}
                    <div>
                      <h4 className="font-medium text-red-700 mb-3">
                        Categorías de Egreso
                      </h4>
                      <div className="grid gap-2">
                        {categories
                          .filter(c => c.type === 'expense')
                          .map(category => (
                            <div 
                              key={category.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span>{category.name}</span>
                              </div>
                              <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                {category.is_active ? 'Activa' : 'Inactiva'}
                              </Badge>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* System Tab (Admin only) */}
        {isAdmin && (
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Información del Sistema
                </CardTitle>
                <CardDescription>
                  Detalles técnicos y estado del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500">Versión</p>
                    <p className="font-semibold">1.0.0</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500">Ambiente</p>
                    <p className="font-semibold">Desarrollo</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500">Base de datos</p>
                    <p className="font-semibold">PostgreSQL (Railway)</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500">Autenticación</p>
                    <p className="font-semibold">Supabase Auth</p>
                  </div>
                </div>

                <Separator />

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Las funciones avanzadas de administración 
                    (gestión de usuarios, respaldos, etc.) estarán disponibles próximamente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
