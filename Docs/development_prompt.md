# 🚀 PROMPT MAESTRO PARA DESARROLLO - SISTEMA SAESTL

## 📋 Contexto del Proyecto

Eres un desarrollador senior especializado en Next.js, TypeScript, Supabase y PostgreSQL. Tu tarea es construir un sistema de gestión financiera para la Sociedad de Alumnos de la Escuela Superior de Tlahuelilpan (SAESTL) de la UAEH.

## 🎯 Objetivo General

Crear una aplicación web progresiva (PWA) que permita administrar las finanzas de la sociedad de alumnos, incluyendo transacciones, rifas, eventos, presupuestos y reportes.

## 🛠️ Stack Tecnológico Obligatorio

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes / Server Actions
- **Base de Datos**: PostgreSQL en Railway
- **Autenticación y Servicios**: Supabase
- **Deployment**: Vercel

## 📊 Estructura de Base de Datos

Usa el siguiente esquema de PostgreSQL (ya creado):

### Tablas principales:
1. **users** - Usuarios del sistema con roles
2. **categories** - Categorías de ingresos/egresos
3. **transactions** - Todas las transacciones financieras
4. **raffles** - Gestión de rifas
5. **raffle_tickets** - Boletos vendidos de rifas
6. **events** - Eventos organizados
7. **event_registrations** - Registros a eventos
8. **budgets** - Presupuestos por categoría
9. **accounts_payable** - Cuentas por pagar
10. **accounts_receivable** - Cuentas por cobrar
11. **monthly_reports** - Informes mensuales
12. **audit_log** - Registro de auditoría

### Roles de usuario:
- **admin**: Acceso total
- **treasurer**: Gestión financiera completa
- **president**: Aprobación de gastos, visualización
- **secretary**: Gestión de eventos y registros
- **viewer**: Solo lectura

## 🎨 Funcionalidades Requeridas

### 1. Sistema de Autenticación
```typescript
// Implementar usando Supabase Auth
// - Login con email/password
// - Recuperación de contraseña
// - Protección de rutas según rol
// - Row Level Security (RLS) en Supabase
```

### 2. Dashboard Principal
**Componentes necesarios:**
- Cards de métricas (Balance, Ingresos, Egresos, Rifas activas)
- Gráfica de Ingresos vs Egresos (usar Recharts)
- Lista de transacciones recientes
- Próximos eventos
- Acciones rápidas
- Estado de presupuestos con barras de progreso

### 3. Gestión de Transacciones
**Características:**
- Formulario para crear ingreso/egreso
- Selección de categoría
- Upload de comprobante (Supabase Storage)
- Sistema de aprobación para gastos grandes
- Filtros por fecha, tipo, categoría
- Exportación a Excel/CSV
- Validación con Zod

**Componentes a crear:**
```typescript
// components/transactions/TransactionForm.tsx
// components/transactions/TransactionList.tsx
// components/transactions/TransactionFilters.tsx
// app/(dashboard)/transactions/page.tsx
```

### 4. Gestión de Rifas
**Características:**
- Crear nueva rifa (nombre, precio boleto, total boletos, fechas)
- Registrar venta de boletos individualmente o en lote
- Dashboard de rifa (boletos vendidos/disponibles, ingresos)
- Realizar sorteo (selección aleatoria de ganador)
- Exportar lista de compradores

**Componentes a crear:**
```typescript
// components/raffles/RaffleForm.tsx
// components/raffles/RaffleCard.tsx
// components/raffles/TicketSaleForm.tsx
// components/raffles/RaffleDrawModal.tsx
// app/(dashboard)/raffles/page.tsx
// app/(dashboard)/raffles/[id]/page.tsx
```

### 5. Gestión de Eventos
**Características:**
- Crear evento (nombre, fecha, ubicación, precio)
- Formulario de registro para participantes
- Lista de registrados con datos de contacto
- Exportar lista a Excel/CSV
- Control de asistencia
- Gestión de pagos

**Componentes a crear:**
```typescript
// components/events/EventForm.tsx
// components/events/EventCard.tsx
// components/events/RegistrationForm.tsx
// components/events/AttendanceList.tsx
// app/(dashboard)/events/page.tsx
// app/(dashboard)/events/[id]/page.tsx
```

### 6. Presupuestos
**Características:**
- Crear presupuesto por categoría y período
- Comparación presupuesto vs real
- Alertas al alcanzar 80% y 100%
- Gráficas de cumplimiento
- Análisis de desviación

**Componentes a crear:**
```typescript
// components/budgets/BudgetForm.tsx
// components/budgets/BudgetProgress.tsx
// components/budgets/BudgetComparison.tsx
// app/(dashboard)/budgets/page.tsx
```

### 7. Reportes e Informes
**Características:**
- Informe mensual automático
- Gráficas interactivas (Recharts)
- Exportación a Excel/CSV/PDF
- Filtros por período
- Comparativas históricas

**Componentes a crear:**
```typescript
// components/reports/MonthlyReport.tsx
// components/reports/FinancialCharts.tsx
// components/reports/ExportButton.tsx
// app/(dashboard)/reports/page.tsx
```

### 8. Cuentas por Cobrar/Pagar
**Características:**
- Registrar deudas y acreencias
- Seguimiento de vencimientos
- Alertas de vencimiento
- Vincular con transacciones al pagar/cobrar

## 🏗️ Estructura de Carpetas a Crear

```
saestl-app/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── transactions/page.tsx
│   │   │   ├── raffles/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── events/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── budgets/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── accounts/
│   │   │   │   ├── payable/page.tsx
│   │   │   │   └── receivable/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── transactions/route.ts
│   │   │   ├── raffles/route.ts
│   │   │   └── events/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/ (shadcn)
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── raffles/
│   │   ├── events/
│   │   ├── budgets/
│   │   ├── reports/
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       └── MobileNav.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── validations/
│   │   │   ├── transaction.ts
│   │   │   ├── raffle.ts
│   │   │   └── event.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── use-transactions.ts
│   │   ├── use-raffles.ts
│   │   ├── use-events.ts
│   │   └── use-auth.ts
│   └── types/
│       └── database.types.ts
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## 📦 Dependencias a Instalar

```bash
# Crear proyecto
npx create-next-app@latest saestl-app --typescript --tailwind --app

# Dependencias principales
npm install @supabase/supabase-js @supabase/ssr
npm install react-hook-form zod @hookform/resolvers
npm install recharts lucide-react
npm install date-fns
npm install xlsx papaparse
npm install @tanstack/react-table

# shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label select textarea
npx shadcn-ui@latest add dialog dropdown-menu table
npx shadcn-ui@latest add toast alert badge
```

## 🔧 Configuración Inicial

### 1. Variables de Entorno (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://user:pass@railway:port/db
```

### 2. Configurar Supabase Client
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 3. Configurar Middleware de Autenticación
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Implementar verificación de autenticación
  // Redirigir a login si no está autenticado
  // Verificar roles para rutas protegidas
}
```

## 🎨 Guías de UI/UX

### Paleta de Colores
- **Primario**: Blue-600 (#2563eb)
- **Ingresos**: Green-500 (#22c55e)
- **Egresos**: Red-500 (#ef4444)
- **Rifas**: Purple-500 (#a855f7)
- **Eventos**: Orange-500 (#f97316)

### Componentes Reutilizables
1. **StatCard**: Card para métricas con icono y valor
2. **DataTable**: Tabla con filtros, paginación y exportación
3. **ChartCard**: Card para gráficas con título y filtros
4. **FormModal**: Modal para formularios
5. **ConfirmDialog**: Diálogo de confirmación

## ✅ Validaciones con Zod

```typescript
// lib/validations/transaction.ts
import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  category_id: z.string().uuid(),
  description: z.string().min(3).max(500),
  date: z.date(),
  payment_method: z.string().optional(),
  receipt_url: z.string().url().optional(),
})

export type TransactionInput = z.infer<typeof transactionSchema>
```

## 🔒 Seguridad - Row Level Security

```sql
-- Ejemplo de políticas RLS en Supabase
CREATE POLICY "Users can view transactions based on role"
ON transactions FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE is_active = true
  )
);

CREATE POLICY "Only admins and treasurers can insert"
ON transactions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'treasurer')
  )
);
```

## 📤 Exportación de Datos

```typescript
// lib/utils/export.ts
import * as XLSX from 'xlsx'

export const exportToExcel = (data: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export const exportToCSV = (data: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(ws)
  const blob = new Blob([csv], { type: 'text/csv' })
  // Download logic
}
```

## 📊 Gráficas con Recharts

```typescript
// components/charts/IncomeExpenseChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export function IncomeExpenseChart({ data }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="income" stroke="#22c55e" />
      <Line type="monotone" dataKey="expense" stroke="#ef4444" />
    </LineChart>
  )
}
```

## 🚀 Optimizaciones

1. **Server Components**: Usar para fetch de datos
2. **Client Components**: Solo cuando necesites interactividad
3. **Suspense**: Para loading states
4. **Image Optimization**: Usar next/image
5. **Code Splitting**: Lazy loading de componentes pesados
6. **Caching**: Implementar caché de queries

## 📱 Responsive Design

- Mobile: Stack vertical, bottom navigation
- Tablet: Sidebar colapsable
- Desktop: Sidebar fijo, layout de 2-3 columnas

## 🧪 Testing (Fase 2)

```typescript
// __tests__/transactions.test.ts
// Implementar tests unitarios y de integración
```

## 📖 Documentación

Genera documentación en código:
```typescript
/**
 * Creates a new transaction in the database
 * @param data - Transaction data validated with Zod
 * @returns Created transaction object
 * @throws Error if user doesn't have permission
 */
```

## 🎯 Priorización de Desarrollo (MVP)

### Fase 1 (2-3 semanas) - MVP
1. Autenticación básica
2. Dashboard con métricas
3. CRUD de transacciones
4. Exportación básica a Excel

### Fase 2 (2 semanas)
5. Gestión de rifas completa
6. Gestión de eventos
7. Gráficas interactivas

### Fase 3 (2 semanas)
8. Presupuestos
9. Cuentas por cobrar/pagar
10. Reportes automáticos
11. Sistema de notificaciones

### Fase 4 (1 semana)
12. PWA features
13. Optimizaciones
14. Testing
15. Documentación

## 🐛 Manejo de Errores

```typescript
// lib/error-handler.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof AppError) {
    // Handle operational error
  } else {
    // Handle programming error
  }
}
```

## 🔔 Sistema de Notificaciones

```typescript
// components/ui/toast-notification.tsx
// Usar sonner o react-hot-toast
import { toast } from 'sonner'

export const showSuccess = (message: string) => {
  toast.success(message)
}

export const showError = (message: string) => {
  toast.error(message)
}
```

## 📋 Checklist Final

- [ ] Base de datos creada en Railway
- [ ] Proyecto Supabase configurado
- [ ] Autenticación funcionando
- [ ] Dashboard principal completo
- [ ] CRUD de transacciones
- [ ] Gestión de rifas
- [ ] Gestión de eventos
- [ ] Presupuestos
- [ ] Reportes y gráficas
- [ ] Exportación Excel/CSV
- [ ] Responsive design
- [ ] PWA configurado
- [ ] RLS configurado
- [ ] Deploy en Vercel
- [ ] Documentación actualizada

---

## 💡 Consejos Adicionales

1. **Commits frecuentes**: Usa conventional commits
2. **TypeScript estricto**: Evita `any`
3. **Componentes pequeños**: Single responsibility
4. **Reutilización**: DRY principle
5. **Performance**: Mide con Lighthouse
6. **Accesibilidad**: ARIA labels
7. **SEO**: Metadata en cada página

## 🆘 Recursos de Ayuda

- Documentación Next.js: https://nextjs.org/docs
- Documentación Supabase: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com
- Recharts: https://recharts.org
- Tailwind CSS: https://tailwindcss.com

---

**¡Usa este prompt para guiar todo el desarrollo! Cada sección tiene instrucciones específicas para implementar.**