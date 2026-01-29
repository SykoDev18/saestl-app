'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useState } from 'react'

interface ChartData {
  month: string
  ingresos: number
  egresos: number
}

interface IncomeExpenseChartProps {
  data?: ChartData[]
}

// Datos reales del CSV de SAESTI 2025-2026
const defaultData: ChartData[] = [
  { month: 'Sep 25', ingresos: 2003, egresos: 0 },      // Remanente 2025
  { month: 'Oct 25', ingresos: 0, egresos: 0 },
  { month: 'Nov 25', ingresos: 0, egresos: 0 },
  { month: 'Dic 25', ingresos: 0, egresos: 0 },
  { month: 'Ene 26', ingresos: 13785, egresos: 7730 },  // Datos reales enero 2026
]

export function IncomeExpenseChart({ data = defaultData }: IncomeExpenseChartProps) {
  const [period, setPeriod] = useState('6months')

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Ingresos vs Egresos</CardTitle>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">3 meses</SelectItem>
            <SelectItem value="6months">6 meses</SelectItem>
            <SelectItem value="12months">12 meses</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full" style={{ minWidth: 300, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString('es-MX')}`, '']}
                labelStyle={{ color: '#111827' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="ingresos" 
                name="Ingresos" 
                fill="#22c55e" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="egresos" 
                name="Egresos" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
