'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  ChevronDown,
  User,
} from 'lucide-react'
import { useState } from 'react'

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
    title: 'Cuentas',
    href: '/accounts',
    icon: Wallet,
    children: [
      { title: 'Por Pagar', href: '/accounts/payable' },
      { title: 'Por Cobrar', href: '/accounts/receivable' },
    ],
  },
  {
    title: 'Mi Perfil',
    href: '/profile',
    icon: User,
  },
  {
    title: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    )
  }

  return (
    <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200 min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <Image
          src="/logo-saesti.png"
          alt="SAESTI Logo"
          width={48}
          height={48}
          className="w-12 h-12 object-contain"
        />
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">SAESTI</h1>
          <p className="text-xs text-gray-500">Gestión Financiera</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const hasChildren = item.children && item.children.length > 0
          const isExpanded = expandedItems.includes(item.title)

          if (hasChildren) {
            return (
              <div key={item.title}>
                <button
                  onClick={() => toggleExpand(item.title)}
                  className={cn(
                    'flex items-center w-full gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.title}</span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors',
                            isChildActive
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          )}
                        >
                          <span className="w-5" />
                          {child.title}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

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

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          SAESTI © {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  )
}
