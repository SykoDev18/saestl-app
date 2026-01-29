'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Ticket, Gift, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default function NewRafflePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prize: '',
    prizeValue: '',
    ticketPrice: '',
    totalTickets: '',
    startDate: '',
    endDate: '',
    drawDate: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Guardar en Supabase
      console.log('Raffle data:', formData)

      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirigir a la lista de rifas
      router.push('/raffles')
    } catch (error) {
      console.error('Error saving raffle:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular potencial de recaudación
  const potentialRevenue = formData.totalTickets && formData.ticketPrice
    ? parseInt(formData.totalTickets) * parseFloat(formData.ticketPrice)
    : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/raffles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Rifa</h1>
          <p className="text-gray-500">Crea una nueva rifa para recaudar fondos</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-600" />
                Información de la Rifa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Rifa *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Rifa de Primavera 2026"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el propósito de la rifa..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ticketPrice">Precio del Boleto *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="ticketPrice"
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="20.00"
                      className="pl-10"
                      value={formData.ticketPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, ticketPrice: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalTickets">Total de Boletos *</Label>
                  <Input
                    id="totalTickets"
                    type="number"
                    min="1"
                    placeholder="200"
                    value={formData.totalTickets}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalTickets: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {potentialRevenue > 0 && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600">Potencial de recaudación</p>
                  <p className="text-2xl font-bold text-purple-700">
                    ${potentialRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prize Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" />
                Premio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prize">Descripción del Premio *</Label>
                <Input
                  id="prize"
                  placeholder="Ej: Audífonos Bluetooth Sony WH-1000XM5"
                  value={formData.prize}
                  onChange={(e) => setFormData(prev => ({ ...prev, prize: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prizeValue">Valor Estimado del Premio</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="prizeValue"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1500.00"
                    className="pl-10"
                    value={formData.prizeValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, prizeValue: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Fechas
              </CardTitle>
              <CardDescription>Define el período de venta y fecha del sorteo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de Inicio *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                  <p className="text-xs text-gray-500">Cuándo inicia la venta de boletos</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha de Cierre *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                  <p className="text-xs text-gray-500">Cuándo termina la venta</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drawDate">Fecha del Sorteo *</Label>
                  <Input
                    id="drawDate"
                    type="date"
                    value={formData.drawDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, drawDate: e.target.value }))}
                    required
                  />
                  <p className="text-xs text-gray-500">Cuándo se realizará el sorteo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Link href="/raffles">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Crear Rifa'}
          </Button>
        </div>
      </form>
    </div>
  )
}
