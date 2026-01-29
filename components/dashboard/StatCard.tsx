import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'income' | 'expense' | 'purple' | 'orange'
}

const variantStyles = {
  default: {
    border: 'border-l-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    trendColor: 'text-blue-600',
  },
  income: {
    border: 'border-l-green-500',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    trendColor: 'text-green-600',
  },
  expense: {
    border: 'border-l-red-500',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    trendColor: 'text-red-600',
  },
  purple: {
    border: 'border-l-purple-500',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    trendColor: 'text-purple-600',
  },
  orange: {
    border: 'border-l-orange-500',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    trendColor: 'text-orange-600',
  },
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
}: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className={cn('border-l-4', styles.border)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={cn('p-3 rounded-lg', styles.iconBg)}>
            <Icon className={cn('w-6 h-6', styles.iconColor)} />
          </div>
        </div>
        {(description || trend) && (
          <div className="mt-2">
            {trend && (
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <span className="text-sm text-gray-500 ml-1">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
