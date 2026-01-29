import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
}

interface RecentTransactionsProps {
  transactions?: Transaction[]
}

// Datos reales del CSV de SAESTI - Enero 2026
const defaultTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Pago Evento Teo',
    amount: 6080,
    type: 'expense',
    category: 'Eventos',
    date: '2026-01-28',
  },
  {
    id: '2',
    description: 'Boletos Teo',
    amount: 6080,
    type: 'income',
    category: 'Eventos',
    date: '2026-01-28',
  },
  {
    id: '3',
    description: 'Renta de Lockers',
    amount: 6600,
    type: 'income',
    category: 'Lockers',
    date: '2026-01-22',
  },
  {
    id: '4',
    description: 'Compra de Botellas',
    amount: 1200,
    type: 'expense',
    category: 'Material',
    date: '2026-01-27',
  },
  {
    id: '5',
    description: 'Pegatinas y Boletos (material)',
    amount: 450,
    type: 'expense',
    category: 'Material',
    date: '2026-01-19',
  },
  {
    id: '6',
    description: 'Venta de Agua',
    amount: 603,
    type: 'income',
    category: 'Ventas',
    date: '2026-01-28',
  },
  {
    id: '7',
    description: 'Copias',
    amount: 102,
    type: 'income',
    category: 'Servicios',
    date: '2026-01-28',
  },
]

export function RecentTransactions({ transactions = defaultTransactions }: RecentTransactionsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Transacciones Recientes</CardTitle>
        <Link 
          href="/transactions" 
          className="text-sm text-blue-600 hover:underline"
        >
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'p-2 rounded-full',
                    transaction.type === 'income'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  )}
                >
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {transaction.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {transaction.category}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDate(transaction.date)}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={cn(
                  'text-sm font-semibold',
                  transaction.type === 'income'
                    ? 'text-green-600'
                    : 'text-red-600'
                )}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatAmount(transaction.amount)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
