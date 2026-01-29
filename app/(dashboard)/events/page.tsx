'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Search,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Event {
  id: string
  name: string
  description: string
  date: string
  time: string
  location: string
  registrations: number
  maxCapacity: number
  ticketPrice: number
  totalRevenue: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
}

// Eventos de SAESTI 2026
const events: Event[] = [
  {
    id: '1',
    name: 'Evento Teo',
    description: 'Evento especial con venta de boletos y actividades para estudiantes',
    date: '2026-01-28',
    time: '10:00',
    location: 'Campus ESTI',
    registrations: 76,
    maxCapacity: 100,
    ticketPrice: 80,
    totalRevenue: 6080,
    status: 'completed',
  },
  {
    id: '2',
    name: 'Renta de Lockers',
    description: 'Asignación y renta de lockers para el semestre Enero-Junio 2026',
    date: '2026-01-22',
    time: '08:00',
    location: 'Edificio Principal ESTI',
    registrations: 33,
    maxCapacity: 50,
    ticketPrice: 200,
    totalRevenue: 6600,
    status: 'ongoing',
  },
  {
    id: '3',
    name: 'Venta de Agua y Copias',
    description: 'Servicio continuo de venta de agua y servicio de copias',
    date: '2026-02-01',
    time: '07:00',
    location: 'Cooperativa SAESTI',
    registrations: 0,
    maxCapacity: 0,
    ticketPrice: 8,
    totalRevenue: 1102,
    status: 'ongoing',
  },
  {
    id: '4',
    name: 'Torneo de Videojuegos',
    description: 'Competencia de videojuegos con premios para los ganadores',
    date: '2026-02-15',
    time: '14:00',
    location: 'Sala de Cómputo ESTI',
    registrations: 0,
    maxCapacity: 32,
    ticketPrice: 50,
    totalRevenue: 0,
    status: 'upcoming',
  },
]

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

const getStatusBadge = (status: Event['status']) => {
  const config = {
    upcoming: { label: 'Próximo', className: 'bg-blue-100 text-blue-700' },
    ongoing: { label: 'En Curso', className: 'bg-green-100 text-green-700' },
    completed: { label: 'Completado', className: 'bg-gray-100 text-gray-700' },
    cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
  }
  return config[status]
}

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = events.reduce((sum, e) => sum + e.totalRevenue, 0)
  const activeEvents = events.filter(e => e.status === 'ongoing' || e.status === 'upcoming').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-gray-500">
            Organiza eventos y gestiona los registros de participantes
          </p>
        </div>
        <Link href="/events/new">
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Evento
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Eventos</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Eventos Activos</p>
                <p className="text-2xl font-bold text-blue-600">{activeEvents}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ingresos por Eventos</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar eventos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {['all', 'upcoming', 'ongoing', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {status === 'all' ? 'Todos' : 
                   status === 'upcoming' ? 'Próximos' :
                   status === 'ongoing' ? 'En Curso' : 'Completados'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredEvents.map((event) => {
          const statusConfig = getStatusBadge(event.status)
          const capacityPercent = event.maxCapacity > 0 
            ? (event.registrations / event.maxCapacity) * 100 
            : 0

          return (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                  </div>
                  <Badge className={statusConfig.className}>
                    {statusConfig.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{event.time} hrs</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  
                  {event.maxCapacity > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Users className="w-4 h-4" />
                          Registros
                        </span>
                        <span className="font-medium">
                          {event.registrations} / {event.maxCapacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all",
                            capacityPercent >= 90 ? "bg-red-500" :
                            capacityPercent >= 70 ? "bg-yellow-500" : "bg-green-500"
                          )}
                          style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-600">
                        {formatCurrency(event.totalRevenue)}
                      </span>
                    </div>
                    {event.ticketPrice > 0 && (
                      <span className="text-sm text-gray-500">
                        Boleto: {formatCurrency(event.ticketPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron eventos
              </h3>
              <p className="text-gray-500">
                Intenta con otros términos de búsqueda o filtros
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
