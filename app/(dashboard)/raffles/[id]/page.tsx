'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Ticket, 
  DollarSign, 
  Users, 
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
  XCircle,
  AlertCircle
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
  DialogTrigger,
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

// Type for raffle with mutable status fields
interface RaffleData {
  id: string
  name: string
  description: string
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

// Mock data - replace with useRaffle hook when connected to Supabase
const mockRaffle: RaffleData = {
  id: '1',
  name: 'Rifa Pro-Graduación 2026',
  description: 'Gran rifa para fondos de graduación',
  ticket_price: 50,
  total_tickets: 200,
  start_date: '2026-01-15',
  end_date: '2026-02-28',
  draw_date: null,
  prize_description: 'Pantalla Samsung 55" + Bocina Bluetooth',
  winner_ticket_number: null,
  winner_name: null,
  winner_phone: null,
  status: 'active',
  created_at: '2026-01-10',
}

const mockTickets = [
  { id: '1', ticket_number: 1, buyer_name: 'Juan Pérez', buyer_phone: '7711234567', buyer_email: 'juan@email.com', sale_date: '2026-01-15', payment_status: 'paid' },
  { id: '2', ticket_number: 2, buyer_name: 'María García', buyer_phone: '7719876543', buyer_email: 'maria@email.com', sale_date: '2026-01-16', payment_status: 'paid' },
  { id: '3', ticket_number: 5, buyer_name: 'Carlos López', buyer_phone: '7715551234', buyer_email: 'carlos@email.com', sale_date: '2026-01-17', payment_status: 'pending' },
  { id: '4', ticket_number: 10, buyer_name: 'Ana Martínez', buyer_phone: '7718889999', buyer_email: 'ana@email.com', sale_date: '2026-01-18', payment_status: 'paid' },
  { id: '5', ticket_number: 15, buyer_name: 'Roberto Sánchez', buyer_phone: '7712223333', buyer_email: 'roberto@email.com', sale_date: '2026-01-19', payment_status: 'paid' },
  { id: '6', ticket_number: 20, buyer_name: 'Laura Torres', buyer_phone: '7714445555', buyer_email: 'laura@email.com', sale_date: '2026-01-20', payment_status: 'paid' },
  { id: '7', ticket_number: 25, buyer_name: 'Pedro Ramírez', buyer_phone: '7716667777', buyer_email: 'pedro@email.com', sale_date: '2026-01-21', payment_status: 'paid' },
  { id: '8', ticket_number: 30, buyer_name: 'Sofía Hernández', buyer_phone: '7718889000', buyer_email: 'sofia@email.com', sale_date: '2026-01-22', payment_status: 'paid' },
]

export default function RaffleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const raffleId = params.id as string

  // State
  const [raffle, setRaffle] = useState<RaffleData>(mockRaffle)
  const [tickets, setTickets] = useState(mockTickets)
  const [searchTerm, setSearchTerm] = useState('')
  const [sellDialogOpen, setSellDialogOpen] = useState(false)
  const [drawDialogOpen, setDrawDialogOpen] = useState(false)
  const [winnerDialogOpen, setWinnerDialogOpen] = useState(false)
  const [selectedWinner, setSelectedWinner] = useState<typeof mockTickets[0] | null>(null)
  const [sellMode, setSellMode] = useState<'single' | 'multiple'>('single')
  
  // Form state for selling tickets
  const [ticketForm, setTicketForm] = useState({
    ticketNumbers: '',
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
  })

  // Calculations
  const soldTickets = tickets.length
  const availableTickets = raffle.total_tickets - soldTickets
  const totalRevenue = tickets.filter(t => t.payment_status === 'paid').length * raffle.ticket_price
  const pendingPayments = tickets.filter(t => t.payment_status === 'pending').length
  const progressPercent = (soldTickets / raffle.total_tickets) * 100
  const soldNumbers = new Set(tickets.map(t => t.ticket_number))

  // Get available numbers
  const getAvailableNumbers = () => {
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
  const handleSellTicket = () => {
    const numbers = sellMode === 'single' 
      ? [parseInt(ticketForm.ticketNumbers)]
      : ticketForm.ticketNumbers.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))

    const newTickets = numbers.map((num, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      ticket_number: num,
      buyer_name: ticketForm.buyerName,
      buyer_phone: ticketForm.buyerPhone,
      buyer_email: ticketForm.buyerEmail,
      sale_date: new Date().toISOString().split('T')[0],
      payment_status: 'paid' as const,
    }))

    setTickets(prev => [...prev, ...newTickets].sort((a, b) => a.ticket_number - b.ticket_number))
    setSellDialogOpen(false)
    setTicketForm({ ticketNumbers: '', buyerName: '', buyerPhone: '', buyerEmail: '' })
  }

  const handleDraw = () => {
    if (tickets.length === 0) return
    
    const randomIndex = Math.floor(Math.random() * tickets.length)
    const winner = tickets[randomIndex]
    setSelectedWinner(winner)
    setDrawDialogOpen(false)
    setWinnerDialogOpen(true)
    
    setRaffle(prev => ({
      ...prev,
      status: 'drawn' as const,
      winner_ticket_number: winner.ticket_number,
      winner_name: winner.buyer_name,
      winner_phone: winner.buyer_phone,
      draw_date: new Date().toISOString().split('T')[0],
    }))
  }

  const handleExport = (format: 'excel' | 'csv') => {
    const exportData = tickets.map(t => ({
      'Número': t.ticket_number,
      'Comprador': t.buyer_name,
      'Teléfono': t.buyer_phone,
      'Email': t.buyer_email,
      'Fecha Venta': t.sale_date,
      'Estado Pago': t.payment_status === 'paid' ? 'Pagado' : 'Pendiente',
    }))

    if (format === 'excel') {
      exportToExcel(exportData, `boletos-${raffle.name}`)
    } else {
      exportToCSV(exportData, `boletos-${raffle.name}`)
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
              disabled={!ticketForm.ticketNumbers || !ticketForm.buyerName || !ticketForm.buyerPhone}
            >
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
            <AlertDialogAction onClick={handleDraw} className="bg-purple-600 hover:bg-purple-700">
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
