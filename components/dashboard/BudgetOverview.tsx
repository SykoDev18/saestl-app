import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface BudgetItem {
  id: string
  name: string
  spent: number
  total: number
  category: string
}

interface BudgetOverviewProps {
  budgets?: BudgetItem[]
}

// Deudas y gastos pendientes de SAESTI 2026
const defaultBudgets: BudgetItem[] = [
  {
    id: '1',
    name: 'Deuda Microondas',
    spent: 0,
    total: 2000,
    category: 'Equipamiento',
  },
  {
    id: '2',
    name: 'Deuda Garrafones',
    spent: 0,
    total: 1800,
    category: 'Suministros',
  },
  {
    id: '3',
    name: 'Deuda SAESTL anterior',
    spent: 0,
    total: 2000,
    category: 'Deudas',
  },
  {
    id: '4',
    name: 'Gasto en Botellas (Enero)',
    spent: 1200,
    total: 1200,
    category: 'Material',
  },
]

export function BudgetOverview({ budgets = defaultBudgets }: BudgetOverviewProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Estado de Presupuestos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {budgets.map((budget) => {
            const percentage = Math.min((budget.spent / budget.total) * 100, 100)
            
            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{budget.name}</p>
                    <p className="text-xs text-gray-500">{budget.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatAmount(budget.spent)} / {formatAmount(budget.total)}
                    </p>
                    <p
                      className={cn(
                        'text-xs font-medium',
                        percentage >= 100
                          ? 'text-red-600'
                          : percentage >= 80
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      )}
                    >
                      {percentage.toFixed(0)}% utilizado
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                  <div 
                    className={cn(
                      "absolute top-0 left-0 h-2 rounded-full transition-all",
                      getProgressColor(percentage)
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
