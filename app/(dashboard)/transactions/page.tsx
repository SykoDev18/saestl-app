'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Plus, 
  Download, 
  Search,
  TrendingUp,
  TrendingDown,
  Filter,
  Calendar,
  ArrowUpDown,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  paymentMethod: string
}

// Datos reales del CSV de SAESTI - Enero 2026
const transactions: Transaction[] = [
  {
    id: '1',
    description: 'Remanente año 2025',
    amount: 2003,
    type: 'income',
    category: 'Remanente',
    date: '2026-01-01',
    paymentMethod: 'Efectivo',
  },
  {
    id: '2',
    description: 'Lockers (33 a $200)',
    amount: 6600,
    type: 'income',
    category: 'Lockers',
    date: '2026-01-22',
    paymentMethod: 'Efectivo',
  },
  {
    id: '3',
    description: 'Pegatinas y Boletos',
    amount: 450,
    type: 'expense',
    category: 'Material',
    date: '2026-01-19',
    paymentMethod: 'Efectivo',
  },
  {
    id: '4',
    description: 'Agua (60 a $8 y 1 a $15)',
    amount: 495,
    type: 'income',
    category: 'Ventas',
    date: '2026-01-27',
    paymentMethod: 'Efectivo',
  },
  {
    id: '5',
    description: 'Botellas',
    amount: 1200,
    type: 'expense',
    category: 'Material',
    date: '2026-01-27',
    paymentMethod: 'Efectivo',
  },
  {
    id: '6',
    description: 'Boletos Teo',
    amount: 6080,
    type: 'income',
    category: 'Eventos',
    date: '2026-01-28',
    paymentMethod: 'Efectivo',
  },
  {
    id: '7',
    description: 'Pago Evento Teo',
    amount: 6080,
    type: 'expense',
    category: 'Eventos',
    date: '2026-01-28',
    paymentMethod: 'Efectivo',
  },
  {
    id: '8',
    description: 'Agua (13 a $8 y 1 a $4)',
    amount: 108,
    type: 'income',
    category: 'Ventas',
    date: '2026-01-28',
    paymentMethod: 'Efectivo',
  },
  {
    id: '9',
    description: 'Copias',
    amount: 102,
    type: 'income',
    category: 'Servicios',
    date: '2026-01-28',
    paymentMethod: 'Efectivo',
  },
  {
    id: '10',
    description: 'Agua - Ventas adicionales',
    amount: 397,
    type: 'income',
    category: 'Ventas',
    date: '2026-01-29',
    paymentMethod: 'Efectivo',
  },
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Calcular totales
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  // Filtrar transacciones
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || t.type === typeFilter
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter
    return matchesSearch && matchesType && matchesCategory
  })

  // Obtener categorías únicas
  const categories = [...new Set(transactions.map(t => t.category))]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transacciones</h1>
          <p className="text-gray-500">
            Gestiona todos los ingresos y egresos de SAESTI
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Link href="/transactions/new">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Transacción
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Ingresos</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Egresos</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Balance Actual</p>
                <p className={cn(
                  "text-2xl font-bold",
                  balance >= 0 ? "text-blue-600" : "text-red-600"
                )}>
                  {formatCurrency(balance)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ArrowUpDown className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar transacciones..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Ingresos</SelectItem>
                <SelectItem value="expense">Egresos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(transaction.date)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.category}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">{transaction.paymentMethod}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-semibold",
                      transaction.type === 'income' ? "text-green-600" : "text-red-600"
                    )}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron transacciones</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
