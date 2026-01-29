'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
  FileSpreadsheet,
  Printer,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  RefreshCw,
  Share2,
  Mail,
  Filter,
  Wallet,
  CreditCard,
  Banknote,
  Coins,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Datos del reporte financiero de SAESTI - Enero 2026
const reportData = {
  period: 'Enero 2026',
  summary: {
    initialBalance: 2003,
    totalIncome: 13785,
    totalExpenses: 7730,
    finalBalance: 8058,
    pendingDebts: 5800,
  },
  incomeByCategory: [
    { category: 'Lockers', amount: 6600, percentage: 47.9, trend: 15 },
    { category: 'Eventos (Boletos)', amount: 6080, percentage: 44.1, trend: 0 },
    { category: 'Ventas de Agua', amount: 1000, percentage: 7.3, trend: 5 },
    { category: 'Copias', amount: 102, percentage: 0.7, trend: -10 },
  ],
  expensesByCategory: [
    { category: 'Eventos (Pago)', amount: 6080, percentage: 78.7, trend: 0 },
    { category: 'Material', amount: 1650, percentage: 21.3, trend: 20 },
  ],
  cashBreakdown: {
    bills: [
      { denomination: '$500', quantity: 10, total: 5000 },
      { denomination: '$200', quantity: 4, total: 800 },
      { denomination: '$100', quantity: 6, total: 600 },
      { denomination: '$50', quantity: 8, total: 400 },
      { denomination: '$20', quantity: 20, total: 400 },
    ],
    coins: [
      { denomination: '$10', quantity: 25, total: 250 },
      { denomination: '$5', quantity: 15, total: 75 },
      { denomination: '$2', quantity: 20, total: 40 },
      { denomination: '$1', quantity: 15, total: 15.50 },
    ],
    digitalAccounts: [
      { name: 'Nu (Transferencia)', amount: 388.15 },
    ],
    totalCash: 7580.50,
    totalDigital: 388.15,
    grandTotal: 7968.65,
  },
  pendingDebts: [
    { name: 'Microondas', amount: 2000, dueDate: '2026-02-15', priority: 'high' },
    { name: 'Garrafones', amount: 1800, dueDate: '2026-02-28', priority: 'medium' },
    { name: 'Deuda SAESTL anterior', amount: 2000, dueDate: '2026-03-15', priority: 'low' },
  ],
}

// Datos históricos para comparativas
const historicalData = {
  'december-2025': {
    period: 'Diciembre 2025',
    income: 8500,
    expenses: 6497,
    balance: 2003,
  },
  'january-2026': {
    period: 'Enero 2026',
    income: 13785,
    expenses: 7730,
    balance: 8058,
  },
}

// Transacciones detalladas
const transactions = [
  { id: '1', date: '2026-01-05', description: 'Pago Lockers (33 unidades)', category: 'Lockers', type: 'income', amount: 6600 },
  { id: '2', date: '2026-01-10', description: 'Venta boletos evento Teo', category: 'Eventos', type: 'income', amount: 6080 },
  { id: '3', date: '2026-01-12', description: 'Venta de agua', category: 'Agua', type: 'income', amount: 1000 },
  { id: '4', date: '2026-01-15', description: 'Servicio de copias', category: 'Copias', type: 'income', amount: 102 },
  { id: '5', date: '2026-01-20', description: 'Pago evento Teo', category: 'Eventos', type: 'expense', amount: 6080 },
  { id: '6', date: '2026-01-22', description: 'Material oficina', category: 'Material', type: 'expense', amount: 850 },
  { id: '7', date: '2026-01-25', description: 'Cartuchos impresora', category: 'Material', type: 'expense', amount: 800 },
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('january-2026')
  const [reportType, setReportType] = useState('financial')
  const [activeTab, setActiveTab] = useState('summary')
  const [compareMode, setCompareMode] = useState(false)
  const [comparePeriod, setComparePeriod] = useState('december-2025')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all'])

  // Calcular comparativas
  const currentData = historicalData['january-2026']
  const previousData = historicalData['december-2025']
  const incomeChange = ((currentData.income - previousData.income) / previousData.income) * 100
  const expenseChange = ((currentData.expenses - previousData.expenses) / previousData.expenses) * 100
  const balanceChange = ((currentData.balance - previousData.balance) / previousData.balance) * 100

  // Indicadores clave
  const profitMargin = ((reportData.summary.totalIncome - reportData.summary.totalExpenses) / reportData.summary.totalIncome) * 100
  const liquidityRatio = reportData.summary.finalBalance / reportData.summary.pendingDebts
  const debtCoverage = reportData.summary.finalBalance >= reportData.summary.pendingDebts

  const handleExportPDF = () => {
    console.log('Exporting PDF...')
    alert('Generando reporte PDF... (funcionalidad en desarrollo)')
  }

  const handleExportExcel = () => {
    console.log('Exporting Excel...')
    alert('Generando archivo Excel... (funcionalidad en desarrollo)')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    alert('Compartir reporte... (funcionalidad en desarrollo)')
  }

  const handleEmailReport = () => {
    alert('Enviar por correo... (funcionalidad en desarrollo)')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getPriorityConfig = (priority: string) => {
    const config: Record<string, { label: string; className: string }> = {
      high: { label: 'Alta', className: 'bg-red-100 text-red-700' },
      medium: { label: 'Media', className: 'bg-yellow-100 text-yellow-700' },
      low: { label: 'Baja', className: 'bg-gray-100 text-gray-700' },
    }
    return config[priority] || config.low
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500">
            Informes financieros y estadísticas de SAESTI
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
          <Button variant="outline" size="sm" onClick={handleEmailReport}>
            <Mail className="w-4 h-4 mr-2" />
            Enviar
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Selecciona período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="january-2026">Enero 2026</SelectItem>
                  <SelectItem value="december-2025">Diciembre 2025</SelectItem>
                  <SelectItem value="q1-2026">Q1 2026</SelectItem>
                  <SelectItem value="semester-2026">Semestre Ene-Jun 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <FileText className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Tipo de reporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Reporte Financiero</SelectItem>
                  <SelectItem value="income">Ingresos Detallados</SelectItem>
                  <SelectItem value="expenses">Egresos Detallados</SelectItem>
                  <SelectItem value="cash">Arqueo de Caja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="compare" 
                checked={compareMode}
                onCheckedChange={(checked) => setCompareMode(checked as boolean)}
              />
              <label htmlFor="compare" className="text-sm cursor-pointer">Comparar con</label>
              {compareMode && (
                <Select value={comparePeriod} onValueChange={setComparePeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="december-2025">Dic 2025</SelectItem>
                    <SelectItem value="november-2025">Nov 2025</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Header */}
      <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Reporte Financiero</h2>
              <p className="text-orange-100">{reportData.period} • SAESTI</p>
            </div>
            <div className="text-right">
              <p className="text-orange-100 text-sm">Balance Final</p>
              <p className="text-3xl font-bold">{formatCurrency(reportData.summary.finalBalance)}</p>
              {compareMode && (
                <p className={cn(
                  "text-sm flex items-center justify-end gap-1 mt-1",
                  balanceChange >= 0 ? "text-green-200" : "text-red-200"
                )}>
                  {balanceChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {balanceChange >= 0 ? '+' : ''}{balanceChange.toFixed(1)}% vs {previousData.period}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Margen de Ganancia</p>
                <p className={cn(
                  "text-2xl font-bold",
                  profitMargin >= 30 ? "text-green-600" : profitMargin >= 15 ? "text-yellow-600" : "text-red-600"
                )}>
                  {profitMargin.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400 mt-1">Ingresos - Egresos / Ingresos</p>
              </div>
              <div className={cn(
                "p-3 rounded-full",
                profitMargin >= 30 ? "bg-green-100" : profitMargin >= 15 ? "bg-yellow-100" : "bg-red-100"
              )}>
                <TrendingUp className={cn(
                  "w-6 h-6",
                  profitMargin >= 30 ? "text-green-600" : profitMargin >= 15 ? "text-yellow-600" : "text-red-600"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ratio de Liquidez</p>
                <p className={cn(
                  "text-2xl font-bold",
                  liquidityRatio >= 1 ? "text-green-600" : "text-red-600"
                )}>
                  {liquidityRatio.toFixed(2)}x
                </p>
                <p className="text-xs text-gray-400 mt-1">Balance / Deudas Pendientes</p>
              </div>
              <div className={cn(
                "p-3 rounded-full",
                liquidityRatio >= 1 ? "bg-green-100" : "bg-red-100"
              )}>
                <Wallet className={cn(
                  "w-6 h-6",
                  liquidityRatio >= 1 ? "text-green-600" : "text-red-600"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cobertura de Deudas</p>
                <div className="flex items-center gap-2">
                  {debtCoverage ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-lg font-bold text-green-600">Cubierta</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                      <span className="text-lg font-bold text-red-600">Insuficiente</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Faltan {formatCurrency(Math.max(0, reportData.summary.pendingDebts - reportData.summary.finalBalance))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes vistas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="details">Detalle</TabsTrigger>
          <TabsTrigger value="cash">Arqueo</TabsTrigger>
          <TabsTrigger value="transactions">Movimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6 mt-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Saldo Inicial</p>
                <p className="text-2xl font-bold text-gray-600">{formatCurrency(reportData.summary.initialBalance)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Ingresos</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData.summary.totalIncome)}</p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Egresos</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(reportData.summary.totalExpenses)}</p>
              </div>
              <ArrowDownRight className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Deudas Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(reportData.summary.pendingDebts)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income & Expenses Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Ingresos por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.incomeByCategory.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-semibold">
                        {formatCurrency(item.amount)}
                      </span>
                      {compareMode && item.trend !== 0 && (
                        <Badge className={item.trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {item.trend > 0 ? '+' : ''}{item.trend}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-right">{item.percentage}%</p>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between font-bold">
                  <span>Total Ingresos</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">{formatCurrency(reportData.summary.totalIncome)}</span>
                    {compareMode && (
                      <Badge className={incomeChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Egresos por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.expensesByCategory.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-600 font-semibold">
                        {formatCurrency(item.amount)}
                      </span>
                      {compareMode && item.trend !== 0 && (
                        <Badge className={item.trend > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                          {item.trend > 0 ? '+' : ''}{item.trend}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-right">{item.percentage}%</p>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between font-bold">
                  <span>Total Egresos</span>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600">{formatCurrency(reportData.summary.totalExpenses)}</span>
                    {compareMode && (
                      <Badge className={expenseChange <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </TabsContent>

      {/* Cash Breakdown */}
      <TabsContent value="cash" className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-600" />
            Arqueo de Caja
          </CardTitle>
          <CardDescription>Desglose del efectivo y cuentas digitales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bills */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-green-600" />
                Billetes
              </h4>
              <div className="space-y-2">
                {reportData.cashBreakdown.bills.map((bill, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{bill.denomination} × {bill.quantity}</span>
                    <span className="font-medium">{formatCurrency(bill.total)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Subtotal Billetes</span>
                    <span>{formatCurrency(reportData.cashBreakdown.bills.reduce((sum, b) => sum + b.total, 0))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coins */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                Monedas
              </h4>
              <div className="space-y-2">
                {reportData.cashBreakdown.coins.map((coin, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{coin.denomination} × {coin.quantity}</span>
                    <span className="font-medium">{formatCurrency(coin.total)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Subtotal Monedas</span>
                    <span>{formatCurrency(reportData.cashBreakdown.coins.reduce((sum, c) => sum + c.total, 0))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Digital */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-600" />
                Cuentas Digitales
              </h4>
              <div className="space-y-2">
                {reportData.cashBreakdown.digitalAccounts.map((account, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{account.name}</span>
                    <span className="font-medium">{formatCurrency(account.amount)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Subtotal Digital</span>
                    <span>{formatCurrency(reportData.cashBreakdown.totalDigital)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-500">Efectivo</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(reportData.cashBreakdown.totalCash)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">Digital</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(reportData.cashBreakdown.totalDigital)}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-500">Total General</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(reportData.cashBreakdown.grandTotal)}</p>
              </div>
            </div>
          </div>

          {/* Diferencia con balance */}
          {Math.abs(reportData.cashBreakdown.grandTotal - reportData.summary.finalBalance) > 1 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Diferencia de {formatCurrency(Math.abs(reportData.cashBreakdown.grandTotal - reportData.summary.finalBalance))} con el balance registrado
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </TabsContent>

      {/* Tab de Detalle */}
      <TabsContent value="details" className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Pending Debts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-yellow-600" />
            Deudas Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData.pendingDebts.map((debt, index) => {
              const priorityConfig = getPriorityConfig(debt.priority)
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={priorityConfig.className}>{priorityConfig.label}</Badge>
                    <div>
                      <p className="font-medium text-gray-900">{debt.name}</p>
                      <p className="text-sm text-gray-500">Vence: {formatDate(debt.dueDate)}</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 text-lg px-3 py-1">
                    {formatCurrency(debt.amount)}
                  </Badge>
                </div>
              )
            })}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="font-bold text-gray-900">Total Deudas</span>
              <span className="text-xl font-bold text-yellow-600">
                {formatCurrency(reportData.summary.pendingDebts)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </TabsContent>

      {/* Tab de Transacciones */}
      <TabsContent value="transactions" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Movimientos del Período</CardTitle>
            <CardDescription>Detalle de todas las transacciones</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(tx.date)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{tx.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tx.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={tx.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {tx.type === 'income' ? 'Ingreso' : 'Egreso'}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-semibold",
                      tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Resumen de transacciones */}
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">Total Ingresos</p>
                  <p className="text-lg font-bold text-green-600">
                    +{formatCurrency(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Egresos</p>
                  <p className="text-lg font-bold text-red-600">
                    -{formatCurrency(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Neto</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(
                      transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) -
                      transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>
    </div>
  )
}
