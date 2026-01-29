'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
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
  Wallet, 
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Search,
  User,
  Phone,
  Mail,
  TrendingUp,
  AlertCircle,
  History,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Bell,
  Filter,
  Download,
  ArrowUpRight,
  Send,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface Receivable {
  id: string
  debtor: string
  contact?: string
  email?: string
  phone?: string
  description: string
  totalAmount: number
  paidAmount: number
  dueDate: string
  status: 'pending' | 'partial' | 'overdue' | 'paid'
  type: 'locker' | 'event' | 'raffle' | 'service' | 'other'
  notes?: string
}

interface CollectionHistory {
  id: string
  receivableId: string
  date: string
  amount: number
  method: 'cash' | 'transfer' | 'card'
  notes?: string
}

// Historial de cobros
const collectionHistory: CollectionHistory[] = [
  // Aún no hay cobros realizados
]

// Cuentas por cobrar de SAESTI 2026
const initialReceivables: Receivable[] = [
  {
    id: '1',
    debtor: 'Lockers pendientes por entregar',
    description: 'Lockers reservados sin pago (17 unidades)',
    totalAmount: 3400,
    paidAmount: 0,
    dueDate: '2026-02-15',
    status: 'pending',
    type: 'locker',
    notes: 'Estudiantes que reservaron locker pero aún no han pagado',
  },
  {
    id: '2',
    debtor: 'Boletos Rifa Primavera',
    description: 'Boletos entregados a vendedores por cobrar',
    totalAmount: 0,
    paidAmount: 0,
    dueDate: '2026-03-15',
    status: 'pending',
    type: 'raffle',
    notes: 'Boletos entregados a vendedores voluntarios',
  },
  {
    id: '3',
    debtor: 'Servicios de copias',
    description: 'Copias realizadas por cobrar',
    totalAmount: 50,
    paidAmount: 0,
    dueDate: '2026-01-31',
    status: 'pending',
    type: 'service',
    notes: 'Copias realizadas a crédito',
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

const getStatusConfig = (status: Receivable['status']) => {
  const config = {
    pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
    partial: { label: 'Pago Parcial', className: 'bg-blue-100 text-blue-700', icon: TrendingUp },
    overdue: { label: 'Vencido', className: 'bg-red-100 text-red-700', icon: AlertCircle },
    paid: { label: 'Cobrado', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  }
  return config[status]
}

const getTypeConfig = (type: Receivable['type']) => {
  const config = {
    locker: { label: 'Lockers', className: 'bg-purple-100 text-purple-700' },
    event: { label: 'Eventos', className: 'bg-green-100 text-green-700' },
    raffle: { label: 'Rifas', className: 'bg-pink-100 text-pink-700' },
    service: { label: 'Servicios', className: 'bg-blue-100 text-blue-700' },
    other: { label: 'Otros', className: 'bg-gray-100 text-gray-700' },
  }
  return config[type]
}

export default function AccountsReceivablePage() {
  const [receivables, setReceivables] = useState<Receivable[]>(initialReceivables)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null)
  const [collectionAmount, setCollectionAmount] = useState('')
  const [collectionMethod, setCollectionMethod] = useState('cash')
  const [collectionNotes, setCollectionNotes] = useState('')
  const [activeTab, setActiveTab] = useState('receivables')
  const [newReceivable, setNewReceivable] = useState({
    debtor: '',
    description: '',
    amount: '',
    dueDate: '',
    type: 'other',
    notes: '',
    contact: '',
  })

  // Calcular totales
  const totalReceivable = receivables.reduce((sum, r) => sum + r.totalAmount, 0)
  const totalCollected = receivables.reduce((sum, r) => sum + r.paidAmount, 0)
  const totalPending = totalReceivable - totalCollected
  const pendingCount = receivables.filter(r => r.status !== 'paid').length
  
  // Calcular vencidos
  const overdueCount = receivables.filter(r => {
    const today = new Date()
    const due = new Date(r.dueDate)
    return due < today && r.status !== 'paid'
  }).length

  // Próximos vencimientos
  const upcomingReceivables = receivables.filter(r => {
    const today = new Date()
    const due = new Date(r.dueDate)
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff >= 0 && diff <= 7 && r.status !== 'paid'
  })

  // Filtrar cuentas
  const filteredReceivables = receivables.filter(r => {
    const matchesSearch = r.debtor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || r.type === filterType
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreateReceivable = () => {
    const newId = (receivables.length + 1).toString()
    const receivable: Receivable = {
      id: newId,
      debtor: newReceivable.debtor,
      description: newReceivable.description,
      totalAmount: parseFloat(newReceivable.amount) || 0,
      paidAmount: 0,
      dueDate: newReceivable.dueDate,
      status: 'pending',
      type: newReceivable.type as Receivable['type'],
      notes: newReceivable.notes,
      contact: newReceivable.contact,
    }
    setReceivables([...receivables, receivable])
    setIsDialogOpen(false)
    setNewReceivable({ debtor: '', description: '', amount: '', dueDate: '', type: 'other', notes: '', contact: '' })
  }

  const handleCollection = () => {
    if (!selectedReceivable || !collectionAmount) return
    const amount = parseFloat(collectionAmount)
    const newPaidAmount = selectedReceivable.paidAmount + amount
    const newStatus = newPaidAmount >= selectedReceivable.totalAmount ? 'paid' : 'partial'
    
    setReceivables(receivables.map(r => 
      r.id === selectedReceivable.id 
        ? { ...r, paidAmount: Math.min(newPaidAmount, r.totalAmount), status: newStatus }
        : r
    ))
    setIsCollectionDialogOpen(false)
    setSelectedReceivable(null)
    setCollectionAmount('')
    setCollectionNotes('')
  }

  const handleFullCollection = (receivable: Receivable) => {
    setReceivables(receivables.map(r => 
      r.id === receivable.id 
        ? { ...r, paidAmount: r.totalAmount, status: 'paid' }
        : r
    ))
  }

  const handleEditReceivable = () => {
    if (!selectedReceivable) return
    setReceivables(receivables.map(r => r.id === selectedReceivable.id ? selectedReceivable : r))
    setIsEditDialogOpen(false)
    setSelectedReceivable(null)
  }

  const handleDeleteReceivable = () => {
    if (!selectedReceivable) return
    setReceivables(receivables.filter(r => r.id !== selectedReceivable.id))
    setIsDeleteDialogOpen(false)
    setSelectedReceivable(null)
  }

  const handleSendReminder = (receivable: Receivable) => {
    alert(`Enviando recordatorio a: ${receivable.debtor}\n(Funcionalidad en desarrollo)`)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cuentas por Cobrar</h1>
          <p className="text-gray-500">
            Gestiona los cobros y pagos por recibir de SAESTI
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Cuenta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Cuenta por Cobrar</DialogTitle>
              <DialogDescription>
                Registra un nuevo cobro pendiente para llevar el control de los ingresos esperados.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="debtor">Deudor / Concepto</Label>
                <Input
                  id="debtor"
                  placeholder="Nombre o concepto del cobro"
                  value={newReceivable.debtor}
                  onChange={(e) => setNewReceivable(prev => ({ ...prev, debtor: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  placeholder="Detalle del cobro"
                  value={newReceivable.description}
                  onChange={(e) => setNewReceivable(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Monto</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-10"
                    value={newReceivable.amount}
                    onChange={(e) => setNewReceivable(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha Límite de Cobro</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newReceivable.dueDate}
                  onChange={(e) => setNewReceivable(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={newReceivable.type}
                  onValueChange={(value) => setNewReceivable(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="locker">Lockers</SelectItem>
                    <SelectItem value="event">Eventos</SelectItem>
                    <SelectItem value="raffle">Rifas</SelectItem>
                    <SelectItem value="service">Servicios</SelectItem>
                    <SelectItem value="other">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contacto (opcional)</Label>
                <Input
                  id="contact"
                  placeholder="Teléfono o email"
                  value={newReceivable.contact}
                  onChange={(e) => setNewReceivable(prev => ({ ...prev, contact: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales..."
                  value={newReceivable.notes}
                  onChange={(e) => setNewReceivable(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateReceivable} className="bg-emerald-600 hover:bg-emerald-700">
                Registrar Cobro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Alerta de cobros próximos */}
      {upcomingReceivables.length > 0 && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-emerald-800">Cobros Próximos a Vencer</h4>
                <p className="text-sm text-emerald-700 mt-1">
                  {upcomingReceivables.length} cuenta(s) vencen en los próximos 7 días:
                </p>
                <ul className="mt-2 space-y-1">
                  {upcomingReceivables.map(r => (
                    <li key={r.id} className="text-sm text-emerald-700 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-medium">{r.debtor}</span>: {formatCurrency(r.totalAmount - r.paidAmount)}
                      </span>
                      <span className="text-xs">Vence: {formatDate(r.dueDate)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total por Cobrar</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalReceivable)}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <Wallet className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Cobrado</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCollected)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendiente de Cobro</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cuentas Activas</p>
                <p className="text-2xl font-bold text-emerald-600">{pendingCount}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Vencidas</p>
                <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receivables">Cuentas por Cobrar</TabsTrigger>
          <TabsTrigger value="history">Historial de Cobros</TabsTrigger>
        </TabsList>

        <TabsContent value="receivables" className="space-y-6 mt-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por deudor o descripción..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="locker">Lockers</SelectItem>
                    <SelectItem value="event">Eventos</SelectItem>
                    <SelectItem value="raffle">Rifas</SelectItem>
                    <SelectItem value="service">Servicios</SelectItem>
                    <SelectItem value="other">Otros</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="partial">Parcial</SelectItem>
                    <SelectItem value="overdue">Vencido</SelectItem>
                    <SelectItem value="paid">Cobrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

      {/* Receivables Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cuentas Pendientes de Cobro</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deudor / Concepto</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceivables.map((receivable) => {
                const statusConfig = getStatusConfig(receivable.status)
                const typeConfig = getTypeConfig(receivable.type)
                const progressPercent = receivable.totalAmount > 0 
                  ? (receivable.paidAmount / receivable.totalAmount) * 100 
                  : 0
                const StatusIcon = statusConfig.icon

                return (
                  <TableRow key={receivable.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {receivable.debtor}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">{receivable.description}</TableCell>
                    <TableCell>
                      <Badge className={typeConfig.className}>
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{formatCurrency(receivable.totalAmount)}</p>
                        {receivable.paidAmount > 0 && (
                          <p className="text-xs text-green-600">
                            Cobrado: {formatCurrency(receivable.paidAmount)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <Progress value={progressPercent} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{progressPercent.toFixed(0)}%</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(receivable.dueDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig.className}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedReceivable(receivable)
                            setIsCollectionDialogOpen(true)
                          }}
                        >
                          Abono
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleFullCollection(receivable)}
                          disabled={receivable.status === 'paid' || receivable.totalAmount === 0}
                        >
                          Cobrar
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedReceivable(receivable)
                              setIsDetailDialogOpen(true)
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendReminder(receivable)}>
                              <Send className="w-4 h-4 mr-2" />
                              Enviar recordatorio
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedReceivable(receivable)
                              setIsEditDialogOpen(true)
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setSelectedReceivable(receivable)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredReceivables.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron cuentas por cobrar</p>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        {/* Tab de Historial */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Historial de Cobros
              </CardTitle>
              <CardDescription>Registro de todos los cobros realizados</CardDescription>
            </CardHeader>
            <CardContent>
              {collectionHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cuenta</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collectionHistory.map(collection => {
                      const receivable = receivables.find(r => r.id === collection.receivableId)
                      return (
                        <TableRow key={collection.id}>
                          <TableCell>{formatDate(collection.date)}</TableCell>
                          <TableCell>{receivable?.debtor || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {collection.method === 'cash' ? 'Efectivo' : 
                               collection.method === 'transfer' ? 'Transferencia' : 'Tarjeta'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-500">{collection.notes || '-'}</TableCell>
                          <TableCell className="text-right font-semibold text-emerald-600">
                            +{formatCurrency(collection.amount)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aún no hay cobros registrados</p>
                  <p className="text-sm text-gray-400 mt-1">Los cobros aparecerán aquí cuando registres abonos o cobros completos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Por Tipo</h4>
            <div className="space-y-2">
              {['locker', 'event', 'raffle', 'service'].map((type) => {
                const typeConfig = getTypeConfig(type as Receivable['type'])
                const count = receivables.filter(r => r.type === type).length
                const total = receivables
                  .filter(r => r.type === type)
                  .reduce((sum, r) => sum + r.totalAmount, 0)
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <Badge className={typeConfig.className}>{typeConfig.label}</Badge>
                    <span className="text-sm font-medium">
                      {count} ({formatCurrency(total)})
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Por Estado</h4>
            <div className="space-y-2">
              {['pending', 'partial', 'overdue', 'paid'].map((status) => {
                const statusConfig = getStatusConfig(status as Receivable['status'])
                const count = receivables.filter(r => r.status === status).length
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
                    <span className="text-sm font-medium">{count} cuentas</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Resumen</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Eficiencia de cobro</span>
                <span className="font-semibold text-emerald-600">
                  {totalReceivable > 0 
                    ? ((totalCollected / totalReceivable) * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>
              <Progress 
                value={totalReceivable > 0 ? (totalCollected / totalReceivable) * 100 : 0} 
                className="h-2" 
              />
              <p className="text-xs text-gray-500">
                {formatCurrency(totalCollected)} cobrado de {formatCurrency(totalReceivable)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de Cobro/Abono */}
      <Dialog open={isCollectionDialogOpen} onOpenChange={setIsCollectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Cobro</DialogTitle>
            <DialogDescription>
              Registra un abono o cobro para: {selectedReceivable?.debtor}
            </DialogDescription>
          </DialogHeader>
          {selectedReceivable && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Total por cobrar</span>
                  <span className="font-semibold">{formatCurrency(selectedReceivable.totalAmount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Ya cobrado</span>
                  <span className="text-emerald-600">{formatCurrency(selectedReceivable.paidAmount)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Pendiente</span>
                  <span className="text-yellow-600">{formatCurrency(selectedReceivable.totalAmount - selectedReceivable.paidAmount)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Monto a cobrar</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-10"
                    value={collectionAmount}
                    onChange={(e) => setCollectionAmount(e.target.value)}
                    max={selectedReceivable.totalAmount - selectedReceivable.paidAmount}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCollectionAmount((selectedReceivable.totalAmount - selectedReceivable.paidAmount).toString())}
                >
                  Cobrar todo ({formatCurrency(selectedReceivable.totalAmount - selectedReceivable.paidAmount)})
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Método de cobro</Label>
                <Select value={collectionMethod} onValueChange={setCollectionMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
                  placeholder="Notas del cobro..."
                  value={collectionNotes}
                  onChange={(e) => setCollectionNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCollectionDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCollection} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Registrar Cobro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Detalles */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la Cuenta</DialogTitle>
          </DialogHeader>
          {selectedReceivable && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Deudor</p>
                  <p className="font-semibold">{selectedReceivable.debtor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <Badge className={getTypeConfig(selectedReceivable.type).className}>
                    {getTypeConfig(selectedReceivable.type).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monto Total</p>
                  <p className="font-semibold text-lg">{formatCurrency(selectedReceivable.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cobrado</p>
                  <p className="font-semibold text-lg text-emerald-600">{formatCurrency(selectedReceivable.paidAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pendiente</p>
                  <p className="font-semibold text-lg text-yellow-600">{formatCurrency(selectedReceivable.totalAmount - selectedReceivable.paidAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vencimiento</p>
                  <p className="font-medium">{formatDate(selectedReceivable.dueDate)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Progreso de cobro</p>
                <Progress value={(selectedReceivable.paidAmount / selectedReceivable.totalAmount) * 100} className="h-3 mt-2" />
                <p className="text-xs text-gray-400 mt-1">
                  {selectedReceivable.totalAmount > 0 
                    ? ((selectedReceivable.paidAmount / selectedReceivable.totalAmount) * 100).toFixed(1) 
                    : 0}% cobrado
                </p>
              </div>
              {selectedReceivable.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notas</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">{selectedReceivable.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cuenta</DialogTitle>
          </DialogHeader>
          {selectedReceivable && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Deudor</Label>
                <Input
                  value={selectedReceivable.debtor}
                  onChange={(e) => setSelectedReceivable({...selectedReceivable, debtor: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                  value={selectedReceivable.description}
                  onChange={(e) => setSelectedReceivable({...selectedReceivable, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Monto Total</Label>
                <Input
                  type="number"
                  value={selectedReceivable.totalAmount}
                  onChange={(e) => setSelectedReceivable({...selectedReceivable, totalAmount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Vencimiento</Label>
                <Input
                  type="date"
                  value={selectedReceivable.dueDate}
                  onChange={(e) => setSelectedReceivable({...selectedReceivable, dueDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={selectedReceivable.type}
                  onValueChange={(value) => setSelectedReceivable({...selectedReceivable, type: value as Receivable['type']})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="locker">Lockers</SelectItem>
                    <SelectItem value="event">Eventos</SelectItem>
                    <SelectItem value="raffle">Rifas</SelectItem>
                    <SelectItem value="service">Servicios</SelectItem>
                    <SelectItem value="other">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditReceivable} className="bg-emerald-600 hover:bg-emerald-700">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cuenta por cobrar?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la cuenta de
              <span className="font-semibold"> "{selectedReceivable?.debtor}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReceivable} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
