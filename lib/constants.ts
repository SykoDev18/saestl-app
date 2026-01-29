// Constantes del sistema SAESTL

export const APP_NAME = 'SAESTL'
export const APP_DESCRIPTION = 'Sistema de Gestión Financiera - Sociedad de Alumnos ESTL'

// Roles del sistema
export const USER_ROLES = {
  ADMIN: 'admin',
  TREASURER: 'treasurer',
  PRESIDENT: 'president',
  SECRETARY: 'secretary',
  VIEWER: 'viewer',
} as const

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  treasurer: 'Tesorero',
  president: 'Presidente',
  secretary: 'Secretario',
  viewer: 'Visualizador',
}

// Colores del sistema
export const COLORS = {
  primary: '#2563eb',    // Blue-600
  income: '#22c55e',     // Green-500
  expense: '#ef4444',    // Red-500
  raffles: '#a855f7',    // Purple-500
  events: '#f97316',     // Orange-500
  budget: '#06b6d4',     // Cyan-500
  accounts: '#eab308',   // Yellow-500
}

// Estados de transacciones
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

export const TRANSACTION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
}

// Tipos de transacción
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  income: 'Ingreso',
  expense: 'Egreso',
}

// Métodos de pago
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'other', label: 'Otro' },
]

// Estados de rifas
export const RAFFLE_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  DRAWN: 'drawn',
} as const

export const RAFFLE_STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  closed: 'Cerrada',
  drawn: 'Sorteada',
}

// Estados de eventos
export const EVENT_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const EVENT_STATUS_LABELS: Record<string, string> = {
  upcoming: 'Próximo',
  ongoing: 'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

// Estados de pago
export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
} as const

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
}

// Estados de asistencia
export const ATTENDANCE_STATUS = {
  REGISTERED: 'registered',
  ATTENDED: 'attended',
  ABSENT: 'absent',
} as const

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  registered: 'Registrado',
  attended: 'Asistió',
  absent: 'Ausente',
}

// Navegación del sidebar
export const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Transacciones',
    href: '/transactions',
    icon: 'ArrowLeftRight',
  },
  {
    title: 'Rifas',
    href: '/raffles',
    icon: 'Ticket',
  },
  {
    title: 'Eventos',
    href: '/events',
    icon: 'Calendar',
  },
  {
    title: 'Presupuestos',
    href: '/budgets',
    icon: 'PiggyBank',
  },
  {
    title: 'Reportes',
    href: '/reports',
    icon: 'FileText',
  },
  {
    title: 'Cuentas',
    href: '/accounts',
    icon: 'Wallet',
    children: [
      { title: 'Por Pagar', href: '/accounts/payable' },
      { title: 'Por Cobrar', href: '/accounts/receivable' },
    ],
  },
  {
    title: 'Configuración',
    href: '/settings',
    icon: 'Settings',
  },
]

// Permisos por rol
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['*'], // Acceso total
  treasurer: [
    'transactions:*',
    'raffles:*',
    'events:*',
    'budgets:*',
    'reports:*',
    'accounts:*',
    'dashboard:view',
  ],
  president: [
    'transactions:view',
    'transactions:approve',
    'raffles:view',
    'events:*',
    'budgets:view',
    'reports:view',
    'accounts:view',
    'dashboard:view',
  ],
  secretary: [
    'transactions:view',
    'raffles:view',
    'raffles:sell',
    'events:*',
    'dashboard:view',
  ],
  viewer: [
    'transactions:view',
    'raffles:view',
    'events:view',
    'budgets:view',
    'reports:view',
    'dashboard:view',
  ],
}

// Formato de moneda
export const CURRENCY = {
  locale: 'es-MX',
  currency: 'MXN',
  symbol: '$',
}

// Formato de fecha
export const DATE_FORMAT = {
  display: 'dd/MM/yyyy',
  displayLong: "d 'de' MMMM 'de' yyyy",
  input: 'yyyy-MM-dd',
  monthYear: 'MMMM yyyy',
}
