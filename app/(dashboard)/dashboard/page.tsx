import { Wallet, TrendingUp, TrendingDown, Ticket } from 'lucide-react'
import {
  StatCard,
  IncomeExpenseChart,
  RecentTransactions,
  QuickActions,
  UpcomingEvents,
  BudgetOverview,
} from '@/components/dashboard'

// Función para formatear moneda
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

export default function DashboardPage() {
  // Datos reales del CSV de contabilidad SAESTI - Enero 2026
  const stats = {
    balance: 8058.00,            // Saldo actual real
    incomeMonth: 13785.00,       // Ingresos totales del mes (Lockers, Agua, Copias, Boletos)
    expenseMonth: 7730.00,       // Egresos totales (Pegatinas, Botellas, Pago Evento Teo)
    pendingDebts: 5800.00,       // Deudas por pagar (Microondas, Garrafones, Deuda SAESTL)
    transactions: 17,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Bienvenido al sistema de gestión financiera de SAESTI
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Balance Actual"
          value={formatCurrency(stats.balance)}
          icon={Wallet}
          variant="income"
          trend={{ value: 302, isPositive: true }}
          description="vs remanente 2025 ($2,003)"
        />
        <StatCard
          title="Ingresos del Mes"
          value={formatCurrency(stats.incomeMonth)}
          icon={TrendingUp}
          variant="default"
          description={`${stats.transactions} transacciones`}
        />
        <StatCard
          title="Egresos del Mes"
          value={formatCurrency(stats.expenseMonth)}
          icon={TrendingDown}
          variant="expense"
          description="Incluye Evento Teo ($6,080)"
        />
        <StatCard
          title="Deudas Pendientes"
          value={formatCurrency(stats.pendingDebts)}
          icon={Ticket}
          variant="purple"
          description="Microondas, Garrafones, SAESTL"
        />
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart />
        <RecentTransactions />
      </div>

      {/* Quick Actions and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <UpcomingEvents />
      </div>

      {/* Budget Overview */}
      <BudgetOverview />
    </div>
  )
}
