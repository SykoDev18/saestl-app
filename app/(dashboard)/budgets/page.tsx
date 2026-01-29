'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
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
  PiggyBank, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  DollarSign,
  Bell,
  Copy,
  Eye,
  Calendar,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface Budget {
  id: string
  name: string
  category: string
  allocated: number
  spent: number
  period: 'monthly' | 'semester' | 'annual'
  startDate: string
  endDate: string
  alertThreshold: number
  alertEnabled: boolean
  notes?: string
}

interface BudgetTransaction {
  id: string
  budgetId: string
  date: string
  description: string
  amount: number
  type: 'expense' | 'adjustment'
}

// Historial de transacciones por presupuesto
const budgetTransactions: BudgetTransaction[] = [
  { id: '1', budgetId: '1', date: '2026-01-15', description: 'Pago evento Teo', amount: 6080, type: 'expense' },
  { id: '2', budgetId: '2', date: '2026-01-20', description: 'Material oficina', amount: 850, type: 'expense' },
  { id: '3', budgetId: '2', date: '2026-01-25', description: 'Cartuchos impresora', amount: 800, type: 'expense' },
]

// Presupuestos de SAESTI 2026
const initialBudgets: Budget[] = [
  {
    id: '1',
    name: 'Eventos del Semestre',
    category: 'Eventos',
    allocated: 15000,
    spent: 6080,
    period: 'semester',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    alertThreshold: 80,
    alertEnabled: true,
    notes: 'Presupuesto para todos los eventos del semestre incluyendo Teo y actividades culturales',
  },
  {
    id: '2',
    name: 'Material y Suministros',
    category: 'Material',
    allocated: 5000,
    spent: 1650,
    period: 'semester',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    alertThreshold: 75,
    alertEnabled: true,
    notes: 'Papelería, cartuchos, material de oficina',
  },
  {
    id: '3',
    name: 'Equipamiento',
    category: 'Equipamiento',
    allocated: 8000,
    spent: 0,
    period: 'annual',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    alertThreshold: 90,
    alertEnabled: false,
    notes: 'Compra de equipo nuevo como microondas, impresoras, etc.',
  },
  {
    id: '4',
    name: 'Rifas y Premios',
    category: 'Rifas',
    allocated: 6000,
    spent: 0,
    period: 'semester',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    alertThreshold: 80,
    alertEnabled: true,
    notes: 'Premios para rifas y sorteos del semestre',
  },
  {
    id: '5',
    name: 'Operación Lockers',
    category: 'Servicios',
    allocated: 2000,
    spent: 0,
    period: 'semester',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    alertThreshold: 70,
    alertEnabled: true,
    notes: 'Mantenimiento y operación del servicio de lockers',
  },
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

const getStatusColor = (percentage: number) => {
  if (percentage >= 100) return 'text-red-600'
  if (percentage >= 80) return 'text-yellow-600'
  return 'text-green-600'
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return 'bg-red-500'
  if (percentage >= 80) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getStatusBadge = (percentage: number) => {
  if (percentage >= 100) return { label: 'Excedido', className: 'bg-red-100 text-red-700' }
  if (percentage >= 80) return { label: 'Crítico', className: 'bg-yellow-100 text-yellow-700' }
  if (percentage >= 50) return { label: 'En uso', className: 'bg-blue-100 text-blue-700' }
  return { label: 'Saludable', className: 'bg-green-100 text-green-700' }
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [filterCategory, setFilterCategory] = useState('all')
  const [newBudget, setNewBudget] = useState({
    name: '',
    category: '',
    allocated: '',
    period: 'semester',
    alertThreshold: '80',
    alertEnabled: true,
    notes: '',
  })

  // Filtrar presupuestos
  const filteredBudgets = filterCategory === 'all' 
    ? budgets 
    : budgets.filter(b => b.category === filterCategory)

  // Calcular totales
  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalRemaining = totalAllocated - totalSpent
  const overallPercentage = (totalSpent / totalAllocated) * 100

  // Presupuestos con alerta
  const alertBudgets = budgets.filter(b => {
    const percentage = (b.spent / b.allocated) * 100
    return b.alertEnabled && percentage >= b.alertThreshold
  })

  const handleCreateBudget = () => {
    const newId = (budgets.length + 1).toString()
    const budget: Budget = {
      id: newId,
      name: newBudget.name,
      category: newBudget.category,
      allocated: parseFloat(newBudget.allocated) || 0,
      spent: 0,
      period: newBudget.period as Budget['period'],
      startDate: '2026-01-01',
      endDate: newBudget.period === 'annual' ? '2026-12-31' : '2026-06-30',
      alertThreshold: parseInt(newBudget.alertThreshold) || 80,
      alertEnabled: newBudget.alertEnabled,
      notes: newBudget.notes,
    }
    setBudgets([...budgets, budget])
    setIsDialogOpen(false)
    setNewBudget({ name: '', category: '', allocated: '', period: 'semester', alertThreshold: '80', alertEnabled: true, notes: '' })
  }

  const handleEditBudget = () => {
    if (!selectedBudget) return
    setBudgets(budgets.map(b => b.id === selectedBudget.id ? selectedBudget : b))
    setIsEditDialogOpen(false)
    setSelectedBudget(null)
  }

  const handleDeleteBudget = () => {
    if (!selectedBudget) return
    setBudgets(budgets.filter(b => b.id !== selectedBudget.id))
    setIsDeleteDialogOpen(false)
    setSelectedBudget(null)
  }

  const handleDuplicateBudget = (budget: Budget) => {
    const newId = (budgets.length + 1).toString()
    const duplicated: Budget = {
      ...budget,
      id: newId,
      name: `${budget.name} (Copia)`,
      spent: 0,
    }
    setBudgets([...budgets, duplicated])
  }

  const getBudgetTransactions = (budgetId: string) => {
    return budgetTransactions.filter(t => t.budgetId === budgetId)
  }

  const categories = [...new Set(budgets.map(b => b.category))]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Presupuestos</h1>
          <p className="text-gray-500">
            Planifica y controla los gastos de SAESTI por categoría
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Presupuesto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Presupuesto</DialogTitle>
              <DialogDescription>
                Define un presupuesto para controlar los gastos en una categoría específica.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Presupuesto</Label>
                <Input
                  id="name"
                  placeholder="Ej: Eventos del Semestre"
                  value={newBudget.name}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={newBudget.category}
                  onValueChange={(value) => setNewBudget(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Eventos">Eventos</SelectItem>
                    <SelectItem value="Material">Material</SelectItem>
                    <SelectItem value="Equipamiento">Equipamiento</SelectItem>
                    <SelectItem value="Rifas">Rifas</SelectItem>
                    <SelectItem value="Servicios">Servicios</SelectItem>
                    <SelectItem value="Otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allocated">Monto Asignado</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="allocated"
                    type="number"
                    placeholder="10000"
                    className="pl-10"
                    value={newBudget.allocated}
                    onChange={(e) => setNewBudget(prev => ({ ...prev, allocated: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">Período</Label>
                <Select
                  value={newBudget.period}
                  onValueChange={(value) => setNewBudget(prev => ({ ...prev, period: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="semester">Semestral</SelectItem>
                    <SelectItem value="annual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alertThreshold">Umbral de Alerta (%)</Label>
                <Input
                  id="alertThreshold"
                  type="number"
                  placeholder="80"
                  value={newBudget.alertThreshold}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, alertThreshold: e.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="alertEnabled">Activar alertas</Label>
                <Switch
                  id="alertEnabled"
                  checked={newBudget.alertEnabled}
                  onCheckedChange={(checked) => setNewBudget(prev => ({ ...prev, alertEnabled: checked }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Descripción o notas del presupuesto..."
                  value={newBudget.notes}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateBudget} className="bg-cyan-600 hover:bg-cyan-700">
                Crear Presupuesto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Alertas Activas */}
      {alertBudgets.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">Alertas de Presupuesto</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  {alertBudgets.length} presupuesto(s) han alcanzado el umbral de alerta:
                </p>
                <ul className="mt-2 space-y-1">
                  {alertBudgets.map(b => {
                    const percentage = (b.spent / b.allocated) * 100
                    return (
                      <li key={b.id} className="text-sm text-yellow-700 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="font-medium">{b.name}</span>: {percentage.toFixed(1)}% usado
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs de navegación */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="details">Detalle</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Filtro por categoría */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => setFilterCategory('all')}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Asignado</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAllocated)}</p>
                  </div>
                  <div className="p-3 bg-cyan-100 rounded-full">
                    <PiggyBank className="w-6 h-6 text-cyan-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Gastado</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</p>
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
                <p className="text-sm text-gray-500">Disponible</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRemaining)}</p>
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
                <p className="text-sm text-gray-500">Uso General</p>
                <p className={cn("text-2xl font-bold", getStatusColor(overallPercentage))}>
                  {overallPercentage.toFixed(1)}%
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-full",
                overallPercentage >= 80 ? "bg-yellow-100" : "bg-green-100"
              )}>
                {overallPercentage >= 80 ? (
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

          {/* Budgets Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBudgets.map((budget) => {
              const percentage = (budget.spent / budget.allocated) * 100
              const remaining = budget.allocated - budget.spent
              const status = getStatusBadge(percentage)
              const isOverThreshold = budget.alertEnabled && percentage >= budget.alertThreshold

              return (
                <Card key={budget.id} className={cn(
                  "hover:shadow-lg transition-shadow",
                  isOverThreshold && "border-yellow-300"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {budget.name}
                          {isOverThreshold && <Bell className="w-4 h-4 text-yellow-500" />}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{budget.category}</Badge>
                          <Badge className={status.className}>{status.label}</Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedBudget(budget)
                            setIsDetailDialogOpen(true)
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedBudget(budget)
                            setIsEditDialogOpen(true)
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateBudget(budget)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setSelectedBudget(budget)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Progreso</span>
                    <span className={cn("font-medium", getStatusColor(percentage))}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={cn("h-3 rounded-full transition-all", getProgressColor(percentage))}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-gray-400">Asignado</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(budget.allocated)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Gastado</p>
                    <p className="text-lg font-semibold text-red-600">{formatCurrency(budget.spent)}</p>
                  </div>
                </div>

                {/* Remaining */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Disponible</span>
                  <span className={cn(
                    "text-lg font-bold",
                    remaining >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatCurrency(remaining)}
                  </span>
                </div>

                {/* Period */}
                <div className="text-xs text-gray-400 text-center">
                  {budget.period === 'monthly' ? 'Mensual' : 
                   budget.period === 'semester' ? 'Semestral' : 'Anual'} • 
                  {budget.startDate} - {budget.endDate}
                </div>
              </CardContent>
            </Card>
          )
        })}
          </div>

          {/* Distribución por categoría */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Categoría</CardTitle>
              <CardDescription>Cómo se distribuye el presupuesto total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map(cat => {
                  const catBudgets = budgets.filter(b => b.category === cat)
                  const catTotal = catBudgets.reduce((sum, b) => sum + b.allocated, 0)
                  const catSpent = catBudgets.reduce((sum, b) => sum + b.spent, 0)
                  const catPercentage = (catTotal / totalAllocated) * 100
                  const spentPercentage = catTotal > 0 ? (catSpent / catTotal) * 100 : 0
                  
                  return (
                    <div key={cat} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{cat}</span>
                        <div className="text-right">
                          <span className="text-sm text-gray-600">{formatCurrency(catTotal)}</span>
                          <span className="text-xs text-gray-400 ml-2">({catPercentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={cn("h-3 rounded-full transition-all", getProgressColor(spentPercentage))}
                          style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Gastado: {formatCurrency(catSpent)}</span>
                        <span>Disponible: {formatCurrency(catTotal - catSpent)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Detalle */}
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Presupuestos</CardTitle>
              <CardDescription>Información completa de cada presupuesto</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Asignado</TableHead>
                    <TableHead>Gastado</TableHead>
                    <TableHead>Disponible</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Alerta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.map(budget => {
                    const percentage = (budget.spent / budget.allocated) * 100
                    const remaining = budget.allocated - budget.spent
                    return (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{budget.category}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(budget.allocated)}</TableCell>
                        <TableCell className="text-red-600">{formatCurrency(budget.spent)}</TableCell>
                        <TableCell className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(remaining)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage} className="w-16 h-2" />
                            <span className="text-xs">{percentage.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {budget.period === 'monthly' ? 'Mensual' : 
                           budget.period === 'semester' ? 'Semestral' : 'Anual'}
                        </TableCell>
                        <TableCell>
                          {budget.alertEnabled ? (
                            <Badge className="bg-green-100 text-green-700">
                              {budget.alertThreshold}%
                            </Badge>
                          ) : (
                            <Badge variant="outline">Desactivada</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Historial */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Transacciones</CardTitle>
              <CardDescription>Movimientos registrados contra presupuestos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Presupuesto</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetTransactions.map(transaction => {
                    const budget = budgets.find(b => b.id === transaction.budgetId)
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {transaction.date}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{budget?.name || 'N/A'}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Badge className={transaction.type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                            {transaction.type === 'expense' ? 'Gasto' : 'Ajuste'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          -{formatCurrency(transaction.amount)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {budgetTransactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay transacciones registradas
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Presupuesto</DialogTitle>
            <DialogDescription>
              Modifica los detalles del presupuesto seleccionado.
            </DialogDescription>
          </DialogHeader>
          {selectedBudget && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={selectedBudget.name}
                  onChange={(e) => setSelectedBudget({...selectedBudget, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Monto Asignado</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="number"
                    className="pl-10"
                    value={selectedBudget.allocated}
                    onChange={(e) => setSelectedBudget({...selectedBudget, allocated: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Umbral de Alerta (%)</Label>
                <Input
                  type="number"
                  value={selectedBudget.alertThreshold}
                  onChange={(e) => setSelectedBudget({...selectedBudget, alertThreshold: parseInt(e.target.value) || 80})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Alertas activadas</Label>
                <Switch
                  checked={selectedBudget.alertEnabled}
                  onCheckedChange={(checked) => setSelectedBudget({...selectedBudget, alertEnabled: checked})}
                />
              </div>
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  value={selectedBudget.notes || ''}
                  onChange={(e) => setSelectedBudget({...selectedBudget, notes: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditBudget} className="bg-cyan-600 hover:bg-cyan-700">Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Detalles */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Presupuesto</DialogTitle>
          </DialogHeader>
          {selectedBudget && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-semibold">{selectedBudget.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Categoría</p>
                  <Badge variant="outline">{selectedBudget.category}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monto Asignado</p>
                  <p className="font-semibold text-cyan-600">{formatCurrency(selectedBudget.allocated)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monto Gastado</p>
                  <p className="font-semibold text-red-600">{formatCurrency(selectedBudget.spent)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Disponible</p>
                  <p className="font-semibold text-green-600">{formatCurrency(selectedBudget.allocated - selectedBudget.spent)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Período</p>
                  <p className="font-medium">{selectedBudget.startDate} - {selectedBudget.endDate}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Progreso</p>
                <Progress value={(selectedBudget.spent / selectedBudget.allocated) * 100} className="h-3" />
                <p className="text-sm text-gray-500 mt-1">
                  {((selectedBudget.spent / selectedBudget.allocated) * 100).toFixed(1)}% utilizado
                </p>
              </div>
              {selectedBudget.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notas</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">{selectedBudget.notes}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-2">Transacciones recientes</p>
                <div className="space-y-2">
                  {getBudgetTransactions(selectedBudget.id).length > 0 ? (
                    getBudgetTransactions(selectedBudget.id).map(t => (
                      <div key={t.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{t.description}</p>
                          <p className="text-xs text-gray-500">{t.date}</p>
                        </div>
                        <span className="text-red-600 font-semibold">-{formatCurrency(t.amount)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">Sin transacciones registradas</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar presupuesto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el presupuesto 
              <span className="font-semibold"> &quot;{selectedBudget?.name}&quot;</span> y todo su historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBudget} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
