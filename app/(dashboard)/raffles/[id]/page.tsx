'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Ticket, 
  DollarSign, 
  Calendar,
  Phone,
  Mail,
  Gift,
  Trophy,
  Search,
  Plus,
  Download,
  Shuffle,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { exportToExcel, exportToCSV } from '@/lib/utils/export'
import type { RaffleStatus } from '@/types/database.types'

interface RaffleData {
  id: string
  name: string
  description: string | null
  ticket_price: number
  total_tickets: number
  start_date: string
  end_date: string
  draw_date: string | null
  prize_description: string
  winner_ticket_number: number | null
  winner_name: string | null
  winner_phone: string | null
  status: RaffleStatus
  created_at: string
}

interface TicketData {
  id: string
  ticket_number: number
  buyer_name: string
  buyer_phone: string
  buyer_email: string | null
  sale_date: string
  payment_status: 'paid' | 'pending'
}

export default function RaffleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const raffleId = params.id as string

  // State
  const [raffle, setRaffle] = useState<RaffleData | null>(null)
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sellDialogOpen, setSellDialogOpen] = useState(false)
  const [drawDialogOpen, setDrawDialogOpen] = useState(false)
  const [winnerDialogOpen, setWinnerDialogOpen] = useState(false)
  const [selectedWinner, setSelectedWinner] = useState<TicketData | null>(null)
  const [sellMode, setSellMode] = useState<'single' | 'multiple'>('single')
  const [submitting, setSubmitting] = useState(false)
  
  // Form state for selling tickets
  const [ticketForm, setTicketForm] = useState({
    ticketNumbers: '',
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
  })

  // Fetch raffle data
  const fetchRaffle = useCallback(async () => {
    try {
      const response = await fetch(`/api/raffles?id=${raffleId}`)
      if (!response.ok) throw new Error('Error al cargar la rifa')
      const data = await response.json()
      if (Array.isArray(data)) {
        const found = data.find((r: RaffleData) => r.id === raffleId)
        if (found) setRaffle(found)
        else throw new Error('Rifa no encontrada')
      } else {
        setRaffle(data)
      }
    } catch (err) {
      console.error('Error fetching raffle:', err)
      setError('No se pudo cargar la información de la rifa')
    }
  }, [raffleId])

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    try {
      const response = await fetch(`/api/raffles/${raffleId}/tickets`)
      if (!response.ok) throw new Error('Error al cargar boletos')
      const data = await response.json()
      setTickets(data || [])
    } catch (err) {
      console.error('Error fetching tickets:', err)
      setTickets([])
    }
  }, [raffleId])

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchRaffle(), fetchTickets()])
      setLoading(false)
    }
    loadData()
  }, [fetchRaffle, fetchTickets])

  // Calculations
  const soldTickets = tickets.length
  const availableTickets = raffle ? raffle.total_tickets - soldTickets : 0
  const totalRevenue = tickets.filter(t => t.payment_status === 'paid').length * (raffle?.ticket_price || 0)
  const pendingPayments = tickets.filter(t => t.payment_status === 'pending').length
  const progressPercent = raffle ? (soldTickets / raffle.total_tickets) * 100 : 0
  const soldNumbers = new Set(tickets.map(t => t.ticket_number))

  // Get available numbers
  const getAvailableNumbers = () => {
    if (!raffle) return []
    const available: number[] = []
    for (let i = 1; i <= raffle.total_tickets; i++) {
      if (!soldNumbers.has(i)) {
        available.push(i)
      }
    }
    return available
  }

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => 
    ticket.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticket_number.toString().includes(searchTerm) ||
    ticket.buyer_phone.includes(searchTerm)
  )

  // Handlers
  const handleSellTicket = async () => {
    if (!raffle) return
    setSubmitting(true)
    
    const numbers = sellMode === 'single' 
      ? [parseInt(ticketForm.ticketNumbers)]
      : ticketForm.ticketNumbers.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))

    try {
      const response = await fetch(`/api/raffles/${raffleId}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_numbers: numbers,
          buyer_name: ticketForm.buyerName,
          buyer_phone: ticketForm.buyerPhone,
          buyer_email: ticketForm.buyerEmail || null,
          payment_status: 'paid'
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error al vender boleto')
      }

      await fetchTickets()
      setSellDialogOpen(false)
      setTicketForm({ ticketNumbers: '', buyerName: '', buyerPhone: '', buyerEmail: '' })
    } catch (err) {
      console.error('Error selling ticket:', err)
      alert(err instanceof Error ? err.message : 'Error al vender boleto')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDraw = async () => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/raffles/${raffleId}/draw`, { method: 'POST' })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error al realizar sorteo')
      }

      const result = await response.json()
      const winnerTicket = tickets.find(t => t.ticket_number === result.winner_ticket_number)
      if (winnerTicket) {
        setSelectedWinner(winnerTicket)
      }
      
      setDrawDialogOpen(false)
      setWinnerDialogOpen(true)
      await fetchRaffle()
    } catch (err) {
      console.error('Error drawing:', err)
      alert(err instanceof Error ? err.message : 'Error al realizar sorteo')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExport = (format: 'excel' | 'csv') => {
    const exportData = tickets.map(t => ({
      'Número': t.ticket_number,
      'Comprador': t.buyer_name,
      'Teléfono': t.buyer_phone,
      'Email': t.buyer_email || '',
      'Fecha Venta': t.sale_date,
      'Estado Pago': t.payment_status === 'paid' ? 'Pagado' : 'Pendiente',
    }))

    if (format === 'excel') {
      exportToExcel(exportData, `boletos-${raffle?.name || 'rifa'}`)
    } else {
      exportToCSV(exportData, `boletos-${raffle?.name || 'rifa'}`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Activa</Badge>
      case 'closed':
        return <Badge className="bg-yellow-100 text-yellow-800">Cerrada</Badge>
      case 'drawn':
        return <Badge className="bg-purple-100 text-purple-800">Sorteada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error || !raffle) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg font-medium text-red-600">{error || 'Rifa no encontrada'}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{raffle.name}</h1>
            <p className="text-muted-foreground">{raffle.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(raffle.status)}
          {raffle.status === 'active' && (
            <>
              <Button onClick={() => setSellDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Vender Boleto
              </Button>
              <Button 
                variant="outline" 
                className="bg-purple-50 text-purple-700 hover:bg-purple-100"
                onClick={() => setDrawDialogOpen(true)}
                disabled={tickets.length === 0}
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Realizar Sorteo
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Winner Banner */}
      {raffle.status === 'drawn' && raffle.winner_name && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm opacity-90">Ganador del Sorteo</p>
                <p className="text-2xl font-bold">{raffle.winner_name}</p>
                <p className="opacity-90">Boleto #{raffle.winner_ticket_number} • {raffle.winner_phone}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Fecha del Sorteo</p>
              <p className="font-semibold">{raffle.draw_date}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Boletos Vendidos
            </CardTitle>
            <Ticket className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{soldTickets} / {raffle.total_tickets}</p>
            <Progress value={progressPercent} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{progressPercent.toFixed(1)}% vendido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              ${raffle.ticket_price} x {tickets.filter(t => t.payment_status === 'paid').length} boletos pagados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Disponibles
            </CardTitle>
            <Gift className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{availableTickets}</p>
            <p className="text-xs text-muted-foreground">Boletos sin vender</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagos Pendientes
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{pendingPayments}</p>
            <p className="text-xs text-muted-foreground">
              ${pendingPayments * raffle.ticket_price} pendiente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">
            <Ticket className="h-4 w-4 mr-2" />
            Boletos Vendidos ({soldTickets})
          </TabsTrigger>
          <TabsTrigger value="available">
            <Gift className="h-4 w-4 mr-2" />
            Disponibles ({availableTickets})
          </TabsTrigger>
          <TabsTrigger value="info">
            <Calendar className="h-4 w-4 mr-2" />
            Información
          </TabsTrigger>
        </TabsList>

        {/* Sold Tickets Tab */}
        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Boletos Vendidos</CardTitle>
                  <CardDescription>Lista de todos los boletos vendidos</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      className="pl-10 w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" onClick={() => handleExport('excel')}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" onClick={() => handleExport('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">#</TableHead>
                    <TableHead>Comprador</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-bold text-purple-600">
                        {ticket.ticket_number}
                      </TableCell>
                      <TableCell className="font-medium">{ticket.buyer_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {ticket.buyer_phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {ticket.buyer_email}
                        </div>
                      </TableCell>
                      <TableCell>{ticket.sale_date}</TableCell>
                      <TableCell>
                        {ticket.payment_status === 'paid' ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Pagado
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No se encontraron boletos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Available Numbers Tab */}
        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle>Números Disponibles</CardTitle>
              <CardDescription>
                {availableTickets} números disponibles para venta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: raffle.total_tickets }, (_, i) => i + 1).map((num) => {
                  const isSold = soldNumbers.has(num)
                  return (
                    <Button
                      key={num}
                      variant={isSold ? "secondary" : "outline"}
                      size="sm"
                      className={`h-10 ${
                        isSold 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'hover:bg-purple-100 hover:text-purple-700 hover:border-purple-300'
                      }`}
                      disabled={isSold || raffle.status !== 'active'}
                      onClick={() => {
                        setTicketForm(prev => ({ ...prev, ticketNumbers: num.toString() }))
                        setSellMode('single')
                        setSellDialogOpen(true)
                      }}
                    >
                      {num}
                    </Button>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded" />
                  <span>Vendido</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border rounded" />
                  <span>Disponible</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Rifa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Precio por Boleto</Label>
                  <p className="text-lg font-semibold">${raffle.ticket_price}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total de Boletos</Label>
                  <p className="text-lg font-semibold">{raffle.total_tickets}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha de Inicio</Label>
                  <p className="text-lg font-semibold">{raffle.start_date}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha de Fin</Label>
                  <p className="text-lg font-semibold">{raffle.end_date}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Premio</Label>
                <p className="text-lg font-semibold">{raffle.prize_description}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sell Ticket Dialog */}
      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vender Boleto</DialogTitle>
            <DialogDescription>
              Registra la venta de uno o más boletos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={sellMode === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSellMode('single')}
              >
                Un boleto
              </Button>
              <Button
                variant={sellMode === 'multiple' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSellMode('multiple')}
              >
                Varios boletos
              </Button>
            </div>
            
            <div>
              <Label>
                {sellMode === 'single' ? 'Número de Boleto' : 'Números de Boleto (separados por coma)'}
              </Label>
              {sellMode === 'single' ? (
                <Select
                  value={ticketForm.ticketNumbers}
                  onValueChange={(value) => setTicketForm(prev => ({ ...prev, ticketNumbers: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un número" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableNumbers().map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        #{num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Ej: 1, 5, 10, 15"
                  value={ticketForm.ticketNumbers}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, ticketNumbers: e.target.value }))}
                />
              )}
            </div>
            
            <div>
              <Label>Nombre del Comprador</Label>
              <Input
                value={ticketForm.buyerName}
                onChange={(e) => setTicketForm(prev => ({ ...prev, buyerName: e.target.value }))}
                placeholder="Nombre completo"
              />
            </div>
            
            <div>
              <Label>Teléfono</Label>
              <Input
                value={ticketForm.buyerPhone}
                onChange={(e) => setTicketForm(prev => ({ ...prev, buyerPhone: e.target.value }))}
                placeholder="771 123 4567"
              />
            </div>
            
            <div>
              <Label>Email (opcional)</Label>
              <Input
                type="email"
                value={ticketForm.buyerEmail}
                onChange={(e) => setTicketForm(prev => ({ ...prev, buyerEmail: e.target.value }))}
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSellDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSellTicket}
              disabled={!ticketForm.ticketNumbers || !ticketForm.buyerName || !ticketForm.buyerPhone || submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Vender Boleto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Draw Confirmation Dialog */}
      <AlertDialog open={drawDialogOpen} onOpenChange={setDrawDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Realizar el Sorteo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se seleccionará un ganador aleatorio entre los {soldTickets} boletos vendidos.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDraw} className="bg-purple-600 hover:bg-purple-700" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Shuffle className="h-4 w-4 mr-2" />
              Realizar Sorteo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Winner Dialog */}
      <Dialog open={winnerDialogOpen} onOpenChange={setWinnerDialogOpen}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl">🎉 ¡Tenemos Ganador! 🎉</DialogTitle>
          </DialogHeader>
          {selectedWinner && (
            <div className="py-8 space-y-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg">
                <Trophy className="h-16 w-16 mx-auto mb-4" />
                <p className="text-4xl font-bold">#{selectedWinner.ticket_number}</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{selectedWinner.buyer_name}</p>
                <p className="text-muted-foreground">{selectedWinner.buyer_phone}</p>
              </div>
            </div>
          )}
          <DialogFooter className="justify-center">
            <Button onClick={() => setWinnerDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
