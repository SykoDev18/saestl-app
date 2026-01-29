'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Credenciales inválidas', {
            description: 'El email o contraseña son incorrectos.',
          })
        } else {
          toast.error('Error al iniciar sesión', {
            description: error.message,
          })
        }
        return
      }

      toast.success('¡Bienvenido!', {
        description: 'Sesión iniciada correctamente.',
      })
      
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Error inesperado', {
        description: 'Por favor intenta de nuevo.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-4 shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">SAESTL</CardTitle>
        <CardDescription>
          Sistema de Gestión Financiera<br />
          Escuela Superior de Tlahuelilpan - UAEH
        </CardDescription>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 font-medium">
            🎓 Inicia sesión con tu correo institucional
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo institucional</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@uaeh.edu.mx"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Solo correos @uaeh.edu.mx
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
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
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm text-gray-500">
          ¿Olvidaste tu contraseña?{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Recuperar
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
