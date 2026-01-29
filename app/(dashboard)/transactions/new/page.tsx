'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const categories = {
  income: [
    { value: 'lockers', label: 'Renta de Lockers' },
    { value: 'water_sales', label: 'Venta de Agua' },
    { value: 'copies', label: 'Copias' },
    { value: 'events', label: 'Eventos' },
    { value: 'raffles', label: 'Rifas' },
    { value: 'donations', label: 'Donaciones' },
    { value: 'fees', label: 'Cuotas' },
    { value: 'other_income', label: 'Otros Ingresos' },
  ],
  expense: [
    { value: 'supplies', label: 'Suministros' },
    { value: 'materials', label: 'Materiales' },
    { value: 'equipment', label: 'Equipamiento' },
    { value: 'events', label: 'Gastos de Eventos' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'services', label: 'Servicios' },
    { value: 'debt_payment', label: 'Pago de Deudas' },
    { value: 'other_expense', label: 'Otros Gastos' },
  ],
}

export default function NewTransactionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income')
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    paymentMethod: 'cash',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Guardar en Supabase
      console.log('Transaction data:', {
        type: transactionType,
        ...formData,
        amount: parseFloat(formData.amount),
      })

      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirigir a la lista de transacciones
      router.push('/transactions')
    } catch (error) {
      console.error('Error saving transaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/transactions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Transacción</h1>
          <p className="text-gray-500">Registra un nuevo ingreso o egreso</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Transaction Type Selection */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Tipo de Transacción</CardTitle>
              <CardDescription>Selecciona si es un ingreso o un egreso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType('income')
                    setFormData(prev => ({ ...prev, category: '' }))
                  }}
                  className={cn(
                    'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all',
                    transactionType === 'income'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  )}
                >
                  <div className={cn(
                    'p-3 rounded-full',
                    transactionType === 'income' ? 'bg-green-100' : 'bg-gray-100'
                  )}>
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <span className="font-semibold text-lg">Ingreso</span>
                  <span className="text-sm opacity-75">Dinero que entra</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTransactionType('expense')
                    setFormData(prev => ({ ...prev, category: '' }))
                  }}
                  className={cn(
                    'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all',
                    transactionType === 'expense'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  )}
                >
                  <div className={cn(
                    'p-3 rounded-full',
                    transactionType === 'expense' ? 'bg-red-100' : 'bg-gray-100'
                  )}>
                    <TrendingDown className="w-8 h-8" />
                  </div>
                  <span className="font-semibold text-lg">Egreso</span>
                  <span className="text-sm opacity-75">Dinero que sale</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Main Form */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Input
                  id="description"
                  placeholder="Ej: Renta de lockers enero"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Monto *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-8"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[transactionType].map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles Adicionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Método de Pago</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="nu">Nu (Cuenta Digital)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Agrega cualquier información adicional..."
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Link href="/transactions">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              transactionType === 'income'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            )}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar Transacción'}
          </Button>
        </div>
      </form>
    </div>
  )
}
