'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Ticket,
  Calendar,
  PiggyBank,
  FileText,
  Wallet,
  Settings,
  GraduationCap,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Transacciones',
    href: '/transactions',
    icon: ArrowLeftRight,
  },
  {
    title: 'Rifas',
    href: '/raffles',
    icon: Ticket,
  },
  {
    title: 'Eventos',
    href: '/events',
    icon: Calendar,
  },
  {
    title: 'Presupuestos',
    href: '/budgets',
    icon: PiggyBank,
  },
  {
    title: 'Reportes',
    href: '/reports',
    icon: FileText,
  },
  {
    title: 'Cuentas por Pagar',
    href: '/accounts/payable',
    icon: Wallet,
  },
  {
    title: 'Cuentas por Cobrar',
    href: '/accounts/receivable',
    icon: Wallet,
  },
  {
    title: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">SAESTL</h1>
          <p className="text-xs text-gray-500">Gestión Financiera</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          SAESTL © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
