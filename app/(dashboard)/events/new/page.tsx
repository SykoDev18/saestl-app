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
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Calendar, MapPin, Users, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default function NewEventPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxCapacity: '',
    ticketPrice: '',
    eventType: 'free',
    isPublic: true,
    requiresRegistration: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Guardar en Supabase
      console.log('Event data:', formData)

      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirigir a la lista de eventos
      router.push('/events')
    } catch (error) {
      console.error('Error saving event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Evento</h1>
          <p className="text-gray-500">Crea y configura un nuevo evento</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Información del Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Evento *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Torneo de Fútbol Rápido"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el evento..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="time">Hora *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType">Tipo de Evento</Label>
                <Select
                  value={formData.eventType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuito</SelectItem>
                    <SelectItem value="paid">Con Costo</SelectItem>
                    <SelectItem value="fundraiser">Recaudación de Fondos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Location & Capacity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Ubicación y Capacidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación *</Label>
                <Input
                  id="location"
                  placeholder="Ej: Auditorio Principal ESTI"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxCapacity">Capacidad Máxima</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="maxCapacity"
                    type="number"
                    min="1"
                    placeholder="100"
                    className="pl-10"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: e.target.value }))}
                  />
                </div>
              </div>

              {formData.eventType !== 'free' && (
                <div className="space-y-2">
                  <Label htmlFor="ticketPrice">Precio del Boleto</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="ticketPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="50.00"
                      className="pl-10"
                      value={formData.ticketPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, ticketPrice: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Configuración del Evento</CardTitle>
              <CardDescription>Ajusta las opciones de visibilidad y registro</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Evento Público</p>
                    <p className="text-sm text-gray-500">Visible para todos los estudiantes</p>
                  </div>
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Requiere Registro</p>
                    <p className="text-sm text-gray-500">Los asistentes deben registrarse</p>
                  </div>
                  <Switch
                    checked={formData.requiresRegistration}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresRegistration: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Link href="/events">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Crear Evento'}
          </Button>
        </div>
      </form>
    </div>
  )
}
