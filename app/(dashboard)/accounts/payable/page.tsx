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
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Search,
  CreditCard,
  History,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Bell,
  Filter,
  Download,
  CalendarClock,
  ArrowDownRight,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface Debt {
  id: string
  creditor: string
  description: string
  totalAmount: number
  paidAmount: number
  dueDate: string
  status: 'pending' | 'partial' | 'overdue' | 'paid'
  priority: 'high' | 'medium' | 'low'
  notes?: string
  reminderDate?: string
}

interface PaymentHistory {
  id: string
  debtId: string
  date: string
  amount: number
  method: 'cash' | 'transfer' | 'card'
  notes?: string
}

// Historial de pagos
const paymentHistory: PaymentHistory[] = [
  // Aún no hay pagos realizados
]

// Deudas de SAESTI 2026 (datos del CSV)
const initialDebts: Debt[] = [
  {
    id: '1',
    creditor: 'Proveedor de Electrodomésticos',
    description: 'Microondas para cooperativa',
    totalAmount: 2000,
    paidAmount: 0,
    dueDate: '2026-02-15',
    status: 'pending',
    priority: 'high',
    notes: 'Microondas para uso de la cooperativa estudiantil',
    reminderDate: '2026-02-10',
  },
  {
    id: '2',
    creditor: 'Proveedor de Agua',
    description: 'Garrafones de agua',
    totalAmount: 1800,
    paidAmount: 0,
    dueDate: '2026-02-28',
    status: 'pending',
    priority: 'medium',
    notes: 'Servicio mensual de garrafones',
    reminderDate: '2026-02-25',
  },
  {
    id: '3',
    creditor: 'SAESTL Anterior',
    description: 'Deuda heredada de administración anterior',
    totalAmount: 2000,
    paidAmount: 0,
    dueDate: '2026-03-15',
    status: 'pending',
    priority: 'low',
    notes: 'Deuda de la administración pasada que debe liquidarse',
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

const getStatusConfig = (status: Debt['status']) => {
  const config = {
    pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
    partial: { label: 'Pago Parcial', className: 'bg-blue-100 text-blue-700', icon: CreditCard },
    overdue: { label: 'Vencida', className: 'bg-red-100 text-red-700', icon: AlertTriangle },
    paid: { label: 'Pagada', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  }
  return config[status]
}

const getPriorityConfig = (priority: Debt['priority']) => {
  const config = {
    high: { label: 'Alta', className: 'bg-red-100 text-red-700' },
    medium: { label: 'Media', className: 'bg-yellow-100 text-yellow-700' },
    low: { label: 'Baja', className: 'bg-gray-100 text-gray-700' },
  }
  return config[priority]
}

const getDaysUntilDue = (dueDate: string) => {
  const today = new Date()
  const due = new Date(dueDate)
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export default function AccountsPayablePage() {
  const [debts, setDebts] = useState<Debt[]>(initialDebts)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [activeTab, setActiveTab] = useState('debts')
  const [newDebt, setNewDebt] = useState({
    creditor: '',
    description: '',
    amount: '',
    dueDate: '',
    priority: 'medium',
    notes: '',
  })

  // Calcular totales
  const totalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0)
  const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0)
  const totalPending = totalDebt - totalPaid
  const pendingCount = debts.filter(d => d.status !== 'paid').length
  const overdueCount = debts.filter(d => {
    const daysUntil = getDaysUntilDue(d.dueDate)
    return daysUntil < 0 && d.status !== 'paid'
  }).length

  // Próximos vencimientos (próximos 7 días)
  const upcomingDebts = debts.filter(d => {
    const days = getDaysUntilDue(d.dueDate)
    return days >= 0 && days <= 7 && d.status !== 'paid'
  })

  // Filtrar deudas
  const filteredDebts = debts.filter(d => {
    const matchesSearch = d.creditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === 'all' || d.priority === filterPriority
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus
    return matchesSearch && matchesPriority && matchesStatus
  })

  const handleCreateDebt = () => {
    const newId = (debts.length + 1).toString()
    const debt: Debt = {
      id: newId,
      creditor: newDebt.creditor,
      description: newDebt.description,
      totalAmount: parseFloat(newDebt.amount) || 0,
      paidAmount: 0,
      dueDate: newDebt.dueDate,
      status: 'pending',
      priority: newDebt.priority as Debt['priority'],
      notes: newDebt.notes,
    }
    setDebts([...debts, debt])
    setIsDialogOpen(false)
    setNewDebt({ creditor: '', description: '', amount: '', dueDate: '', priority: 'medium', notes: '' })
  }

  const handlePayment = () => {
    if (!selectedDebt || !paymentAmount) return
    const amount = parseFloat(paymentAmount)
    const newPaidAmount = selectedDebt.paidAmount + amount
    const newStatus = newPaidAmount >= selectedDebt.totalAmount ? 'paid' : 'partial'
    
    setDebts(debts.map(d => 
      d.id === selectedDebt.id 
        ? { ...d, paidAmount: Math.min(newPaidAmount, d.totalAmount), status: newStatus }
        : d
    ))
    setIsPaymentDialogOpen(false)
    setSelectedDebt(null)
    setPaymentAmount('')
    setPaymentNotes('')
  }

  const handleFullPayment = (debt: Debt) => {
    setDebts(debts.map(d => 
      d.id === debt.id 
        ? { ...d, paidAmount: d.totalAmount, status: 'paid' }
        : d
    ))
  }

  const handleEditDebt = () => {
    if (!selectedDebt) return
    setDebts(debts.map(d => d.id === selectedDebt.id ? selectedDebt : d))
    setIsEditDialogOpen(false)
    setSelectedDebt(null)
  }

  const handleDeleteDebt = () => {
    if (!selectedDebt) return
    setDebts(debts.filter(d => d.id !== selectedDebt.id))
    setIsDeleteDialogOpen(false)
    setSelectedDebt(null)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cuentas por Pagar</h1>
          <p className="text-gray-500">
            Gestiona las deudas y pagos pendientes de SAESTI
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Deuda
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nueva Deuda</DialogTitle>
              <DialogDescription>
                Registra una nueva cuenta por pagar para llevar el control de las deudas.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="creditor">Acreedor</Label>
                <Input
                  id="creditor"
                  placeholder="Nombre del proveedor o acreedor"
                  value={newDebt.creditor}
                  onChange={(e) => setNewDebt(prev => ({ ...prev, creditor: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  placeholder="Concepto de la deuda"
                  value={newDebt.description}
                  onChange={(e) => setNewDebt(prev => ({ ...prev, description: e.target.value }))}
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
                    value={newDebt.amount}
                    onChange={(e) => setNewDebt(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newDebt.dueDate}
                  onChange={(e) => setNewDebt(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select
                  value={newDebt.priority}
                  onValueChange={(value) => setNewDebt(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales..."
                  value={newDebt.notes}
                  onChange={(e) => setNewDebt(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateDebt} className="bg-yellow-600 hover:bg-yellow-700">
                Registrar Deuda
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Alerta de vencimientos próximos */}
      {upcomingDebts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800">Vencimientos Próximos</h4>
                <p className="text-sm text-red-700 mt-1">
                  {upcomingDebts.length} deuda(s) vencen en los próximos 7 días:
                </p>
                <ul className="mt-2 space-y-1">
                  {upcomingDebts.map(d => (
                    <li key={d.id} className="text-sm text-red-700 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="font-medium">{d.creditor}</span>: {formatCurrency(d.totalAmount - d.paidAmount)}
                      </span>
                      <span className="text-xs">Vence: {formatDate(d.dueDate)}</span>
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
                <p className="text-sm text-gray-500">Total Deudas</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDebt)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Wallet className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pagado</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
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
                <p className="text-sm text-gray-500">Pendiente por Pagar</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPending)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cuentas Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
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
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="debts">Deudas</TabsTrigger>
          <TabsTrigger value="history">Historial de Pagos</TabsTrigger>
        </TabsList>

        <TabsContent value="debts" className="space-y-6 mt-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por acreedor o descripción..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
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
                    <SelectItem value="overdue">Vencida</SelectItem>
                    <SelectItem value="paid">Pagada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

      {/* Debts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cuentas Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Acreedor</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDebts.map((debt) => {
                const statusConfig = getStatusConfig(debt.status)
                const priorityConfig = getPriorityConfig(debt.priority)
                const progressPercent = (debt.paidAmount / debt.totalAmount) * 100
                const daysUntilDue = getDaysUntilDue(debt.dueDate)
                const StatusIcon = statusConfig.icon

                return (
                  <TableRow key={debt.id}>
                    <TableCell className="font-medium">{debt.creditor}</TableCell>
                    <TableCell className="text-gray-500">{debt.description}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{formatCurrency(debt.totalAmount)}</p>
                        {debt.paidAmount > 0 && (
                          <p className="text-xs text-green-600">
                            Pagado: {formatCurrency(debt.paidAmount)}
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
                        <div>
                          <p>{formatDate(debt.dueDate)}</p>
                          <p className={cn(
                            "text-xs",
                            daysUntilDue < 0 ? "text-red-600" :
                            daysUntilDue <= 7 ? "text-yellow-600" : "text-gray-500"
                          )}>
                            {daysUntilDue < 0 
                              ? `Vencido hace ${Math.abs(daysUntilDue)} días`
                              : daysUntilDue === 0 
                              ? 'Vence hoy'
                              : `En ${daysUntilDue} días`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig.className}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityConfig.className}>
                        {priorityConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedDebt(debt)
                            setIsPaymentDialogOpen(true)
                          }}
                        >
                          Abonar
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleFullPayment(debt)}
                          disabled={debt.status === 'paid'}
                        >
                          Pagar
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedDebt(debt)
                              setIsDetailDialogOpen(true)
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedDebt(debt)
                              setIsEditDialogOpen(true)
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setSelectedDebt(debt)
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

          {filteredDebts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron cuentas por pagar</p>
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
                Historial de Pagos
              </CardTitle>
              <CardDescription>Registro de todos los pagos realizados</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Deuda</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map(payment => {
                      const debt = debts.find(d => d.id === payment.debtId)
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.date)}</TableCell>
                          <TableCell>{debt?.creditor || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {payment.method === 'cash' ? 'Efectivo' : 
                               payment.method === 'transfer' ? 'Transferencia' : 'Tarjeta'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-500">{payment.notes || '-'}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aún no hay pagos registrados</p>
                  <p className="text-sm text-gray-400 mt-1">Los pagos aparecerán aquí cuando realices abonos o pagos completos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de Pago/Abono */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Registra un abono o pago para: {selectedDebt?.creditor}
            </DialogDescription>
          </DialogHeader>
          {selectedDebt && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Total de la deuda</span>
                  <span className="font-semibold">{formatCurrency(selectedDebt.totalAmount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Ya pagado</span>
                  <span className="text-green-600">{formatCurrency(selectedDebt.paidAmount)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Pendiente</span>
                  <span className="text-yellow-600">{formatCurrency(selectedDebt.totalAmount - selectedDebt.paidAmount)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Monto a pagar</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-10"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={selectedDebt.totalAmount - selectedDebt.paidAmount}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPaymentAmount((selectedDebt.totalAmount - selectedDebt.paidAmount).toString())}
                >
                  Pagar todo ({formatCurrency(selectedDebt.totalAmount - selectedDebt.paidAmount)})
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Método de pago</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
                  placeholder="Notas del pago..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handlePayment} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Registrar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Detalles */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la Deuda</DialogTitle>
          </DialogHeader>
          {selectedDebt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Acreedor</p>
                  <p className="font-semibold">{selectedDebt.creditor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prioridad</p>
                  <Badge className={getPriorityConfig(selectedDebt.priority).className}>
                    {getPriorityConfig(selectedDebt.priority).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monto Total</p>
                  <p className="font-semibold text-lg">{formatCurrency(selectedDebt.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pagado</p>
                  <p className="font-semibold text-lg text-green-600">{formatCurrency(selectedDebt.paidAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pendiente</p>
                  <p className="font-semibold text-lg text-yellow-600">{formatCurrency(selectedDebt.totalAmount - selectedDebt.paidAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vencimiento</p>
                  <p className="font-medium">{formatDate(selectedDebt.dueDate)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Progreso de pago</p>
                <Progress value={(selectedDebt.paidAmount / selectedDebt.totalAmount) * 100} className="h-3 mt-2" />
                <p className="text-xs text-gray-400 mt-1">
                  {((selectedDebt.paidAmount / selectedDebt.totalAmount) * 100).toFixed(1)}% pagado
                </p>
              </div>
              {selectedDebt.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notas</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">{selectedDebt.notes}</p>
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
            <DialogTitle>Editar Deuda</DialogTitle>
          </DialogHeader>
          {selectedDebt && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Acreedor</Label>
                <Input
                  value={selectedDebt.creditor}
                  onChange={(e) => setSelectedDebt({...selectedDebt, creditor: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                  value={selectedDebt.description}
                  onChange={(e) => setSelectedDebt({...selectedDebt, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Monto Total</Label>
                <Input
                  type="number"
                  value={selectedDebt.totalAmount}
                  onChange={(e) => setSelectedDebt({...selectedDebt, totalAmount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Vencimiento</Label>
                <Input
                  type="date"
                  value={selectedDebt.dueDate}
                  onChange={(e) => setSelectedDebt({...selectedDebt, dueDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select
                  value={selectedDebt.priority}
                  onValueChange={(value) => setSelectedDebt({...selectedDebt, priority: value as Debt['priority']})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditDebt} className="bg-yellow-600 hover:bg-yellow-700">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar deuda?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la deuda con
              <span className="font-semibold"> "{selectedDebt?.creditor}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDebt} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
