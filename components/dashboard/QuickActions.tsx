import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import {
  PlusCircle,
  Ticket,
  Calendar,
  FileText,
} from 'lucide-react'

const quickActions = [
  {
    title: 'Nueva Transacción',
    href: '/transactions/new',
    icon: PlusCircle,
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Vender Boleto',
    href: '/raffles',
    icon: Ticket,
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Crear Evento',
    href: '/events/new',
    icon: Calendar,
    gradient: 'from-green-500 to-green-600',
  },
  {
    title: 'Generar Reporte',
    href: '/reports',
    icon: FileText,
    gradient: 'from-orange-500 to-orange-600',
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br ${action.gradient} text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1`}
            >
              <action.icon className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium text-center">{action.title}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
