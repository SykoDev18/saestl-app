'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  Ticket, 
  Search,
  DollarSign,
  Users,
  Trophy,
  Clock,
  Calendar,
  Gift,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Raffle {
  id: string
  name: string
  description: string
  prize: string
  prizeValue: number
  ticketPrice: number
  totalTickets: number
  soldTickets: number
  startDate: string
  endDate: string
  drawDate: string
  status: 'active' | 'upcoming' | 'completed' | 'cancelled'
  winner?: string
}

// Rifas de SAESTI 2026
const raffles: Raffle[] = [
  {
    id: '1',
    name: 'Rifa de Primavera',
    description: 'Gran rifa para recaudar fondos para el evento de primavera',
    prize: 'Audífonos Bluetooth Sony',
    prizeValue: 1500,
    ticketPrice: 20,
    totalTickets: 200,
    soldTickets: 0,
    startDate: '2026-02-15',
    endDate: '2026-03-15',
    drawDate: '2026-03-20',
    status: 'upcoming',
  },
  {
    id: '2',
    name: 'Rifa Tech',
    description: 'Gana increíbles gadgets tecnológicos',
    prize: 'Tablet Samsung Galaxy Tab',
    prizeValue: 4500,
    ticketPrice: 50,
    totalTickets: 150,
    soldTickets: 0,
    startDate: '2026-03-01',
    endDate: '2026-04-01',
    drawDate: '2026-04-05',
    status: 'upcoming',
  },
  {
    id: '3',
    name: 'Rifa Semana ESTI',
    description: 'Participa durante la semana de aniversario',
    prize: 'Bicicleta de Montaña',
    prizeValue: 6000,
    ticketPrice: 30,
    totalTickets: 300,
    soldTickets: 0,
    startDate: '2026-04-15',
    endDate: '2026-05-15',
    drawDate: '2026-05-20',
    status: 'upcoming',
  },
]

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

const getStatusConfig = (status: Raffle['status']) => {
  const config = {
    active: { label: 'Activa', className: 'bg-green-100 text-green-700', icon: Ticket },
    upcoming: { label: 'Próxima', className: 'bg-blue-100 text-blue-700', icon: Clock },
    completed: { label: 'Finalizada', className: 'bg-gray-100 text-gray-700', icon: Trophy },
    cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-700', icon: Ticket },
  }
  return config[status]
}

export default function RafflesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredRaffles = raffles.filter(raffle => {
    const matchesSearch = raffle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         raffle.prize.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || raffle.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalTicketsSold = raffles.reduce((sum, r) => sum + r.soldTickets, 0)
  const totalRevenue = raffles.reduce((sum, r) => sum + (r.soldTickets * r.ticketPrice), 0)
  const activeRaffles = raffles.filter(r => r.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rifas</h1>
          <p className="text-gray-500">
            Administra las rifas y venta de boletos de SAESTI
          </p>
        </div>
        <Link href="/raffles/new">
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Rifa
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rifas Activas</p>
                <p className="text-2xl font-bold text-purple-600">{activeRaffles}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Ticket className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Boletos Vendidos</p>
                <p className="text-2xl font-bold text-blue-600">{totalTicketsSold}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ingresos</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Próximas Rifas</p>
                <p className="text-2xl font-bold text-orange-600">
                  {raffles.filter(r => r.status === 'upcoming').length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar rifas..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'upcoming', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  {status === 'all' ? 'Todas' : 
                   status === 'active' ? 'Activas' :
                   status === 'upcoming' ? 'Próximas' : 'Finalizadas'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raffles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRaffles.map((raffle) => {
          const statusConfig = getStatusConfig(raffle.status)
          const soldPercent = (raffle.soldTickets / raffle.totalTickets) * 100
          const potentialRevenue = raffle.totalTickets * raffle.ticketPrice
          const currentRevenue = raffle.soldTickets * raffle.ticketPrice

          return (
            <Card key={raffle.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className={cn(
                "h-2",
                raffle.status === 'active' ? "bg-gradient-to-r from-purple-500 to-pink-500" :
                raffle.status === 'upcoming' ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                "bg-gray-200"
              )} />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{raffle.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{raffle.description}</p>
                  </div>
                  <Badge className={statusConfig.className}>
                    {statusConfig.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Prize */}
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Gift className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Premio</p>
                    <p className="font-semibold text-gray-900">{raffle.prize}</p>
                    <p className="text-sm text-gray-500">Valor: {formatCurrency(raffle.prizeValue)}</p>
                  </div>
                </div>

                {/* Ticket Sales Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Boletos vendidos</span>
                    <span className="font-medium">{raffle.soldTickets} / {raffle.totalTickets}</span>
                  </div>
                  <Progress value={soldPercent} className="h-2" />
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-gray-500">Recaudado: {formatCurrency(currentRevenue)}</span>
                    <span className="text-gray-400">Meta: {formatCurrency(potentialRevenue)}</span>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <p className="text-xs text-gray-400">Inicia</p>
                      <p>{formatDate(raffle.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Trophy className="w-4 h-4" />
                    <div>
                      <p className="text-xs text-gray-400">Sorteo</p>
                      <p>{formatDate(raffle.drawDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400">Precio del boleto</p>
                    <p className="text-xl font-bold text-purple-600">
                      {formatCurrency(raffle.ticketPrice)}
                    </p>
                  </div>
                  {raffle.status === 'active' && (
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Ticket className="w-4 h-4 mr-2" />
                      Vender Boletos
                    </Button>
                  )}
                  {raffle.status === 'upcoming' && (
                    <Button size="sm" variant="outline">
                      Ver Detalles
                    </Button>
                  )}
                </div>

                {raffle.winner && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Ganador: {raffle.winner}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredRaffles.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Ticket className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron rifas
              </h3>
              <p className="text-gray-500 mb-4">
                Crea una nueva rifa para comenzar a vender boletos
              </p>
              <Link href="/raffles/new">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Rifa
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
