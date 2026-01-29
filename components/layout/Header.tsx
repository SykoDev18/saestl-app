'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Bell, Menu, LogOut, User, Settings, X, Check, DollarSign, Calendar, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MobileNav } from './MobileNav'
import { ROLE_LABELS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Page titles mapping
const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transacciones',
  '/raffles': 'Rifas',
  '/events': 'Eventos',
  '/budgets': 'Presupuestos',
  '/reports': 'Reportes',
  '/accounts/payable': 'Cuentas por Pagar',
  '/accounts/receivable': 'Cuentas por Cobrar',
  '/profile': 'Mi Perfil',
  '/settings': 'Configuración',
}

interface Notification {
  id: string
  type: 'transaction' | 'event' | 'raffle' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: Date
}

interface HeaderProps {
  user?: {
    full_name: string
    email: string
    role: string
    avatar_url?: string | null
  } | null
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Simulated notifications - In production, fetch from database
  useEffect(() => {
    // Demo notifications
    setNotifications([
      {
        id: '1',
        type: 'transaction',
        title: 'Nueva transacción',
        message: 'Se registró un ingreso de $500.00 por cuotas',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      },
      {
        id: '2',
        type: 'event',
        title: 'Evento próximo',
        message: 'Kermes SAESTL en 3 días',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        id: '3',
        type: 'raffle',
        title: 'Rifa activa',
        message: 'Quedan 20 boletos de la rifa de laptops',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
    ])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Sesión cerrada correctamente')
    router.push('/login')
    router.refresh()
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('Todas las notificaciones marcadas como leídas')
  }

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return <DollarSign className="h-4 w-4 text-green-600" />
      case 'event':
        return <Calendar className="h-4 w-4 text-purple-600" />
      case 'raffle':
        return <Ticket className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'Hace un momento'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `Hace ${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Hace ${hours}h`
    const days = Math.floor(hours / 24)
    return `Hace ${days}d`
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const pageTitle = PAGE_TITLES[pathname] || 'Sistema de Gestión'

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <MobileNav />
        </SheetContent>
      </Sheet>

      {/* Page Title */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900 md:text-xl">
          {pageTitle}
        </h2>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              <span className="sr-only">Notificaciones</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-4 border-b">
              <h4 className="font-semibold">Notificaciones</h4>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600 hover:text-blue-700"
                  onClick={markAllAsRead}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Marcar todas
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 -mr-2 -mt-1"
                              onClick={() => clearNotification(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.read && (
                              <Badge 
                                variant="secondary" 
                                className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Nueva
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                className="w-full text-sm text-gray-600"
                onClick={() => {
                  setNotificationsOpen(false)
                  // Could navigate to a notifications page
                }}
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url || undefined} />
                <AvatarFallback className="bg-blue-600 text-white text-sm">
                  {user ? getInitials(user.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-none">
                  {user?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role ? ROLE_LABELS[user.role] : 'Sin rol'}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.full_name || 'Usuario'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Mi Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
