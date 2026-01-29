# Arquitectura del Sistema - SAESTL

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    CAPA DE CLIENTE                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Next.js 14 (App Router)                  │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────┐  │   │
│  │  │  Dashboard │  │ Transacciones│  │  Rifas  │  │   │
│  │  └────────────┘  └──────────────┘  └─────────┘  │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────┐  │   │
│  │  │   Eventos  │  │ Presupuestos │  │Reportes │  │   │
│  │  └────────────┘  └──────────────┘  └─────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│              React + TypeScript + Tailwind              │
└─────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  CAPA DE API / BACKEND                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │        Next.js API Routes / Server Actions       │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │  /api/transactions  /api/raffles           │  │   │
│  │  │  /api/events        /api/budgets           │  │   │
│  │  │  /api/reports       /api/users             │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│              Middleware + Autenticación                 │
└─────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 CAPA DE SERVICIOS                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │             Supabase Client                      │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────┐  │   │
│  │  │     Auth    │  │   Database   │  │Storage │  │   │
│  │  └─────────────┘  └──────────────┘  └────────┘  │   │
│  │  ┌─────────────┐  ┌──────────────┐              │   │
│  │  │  Real-time  │  │  Row Level   │              │   │
│  │  │Subscriptions│  │   Security   │              │   │
│  │  └─────────────┘  └──────────────┘              │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   CAPA DE DATOS                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │          PostgreSQL Database (Railway)           │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │  Tables: users, transactions, categories   │  │   │
│  │  │          raffles, events, budgets          │  │   │
│  │  │          accounts_payable/receivable       │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 📦 Stack Tecnológico Detallado

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Gráficas**: Recharts
- **Formularios**: React Hook Form + Zod
- **Gestión de Estado**: Zustand (para estado global ligero)
- **Tablas**: TanStack Table
- **Exportación**: xlsx, papaparse

### Backend
- **Runtime**: Next.js API Routes / Server Actions
- **ORM**: Prisma (opcional, puedes usar Supabase directo)
- **Autenticación**: Supabase Auth
- **Validación**: Zod

### Base de Datos y Servicios
- **Base de Datos**: PostgreSQL en Railway
- **BaaS**: Supabase (Auth, Storage, Real-time)
- **Storage**: Supabase Storage (para comprobantes)

### DevOps y Deployment
- **Hosting Frontend**: Vercel
- **Hosting Database**: Railway
- **Control de Versiones**: Git + GitHub
- **CI/CD**: Vercel automático

## 🔐 Sistema de Autenticación y Autorización

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso total, gestión de usuarios, configuración |
| **Tesorero** | Todas las operaciones financieras, crear reportes |
| **Presidente** | Ver reportes, aprobar gastos grandes, gestión eventos |
| **Secretario** | Registrar eventos, ver transacciones |
| **Visualizador** | Solo lectura de reportes y dashboard |

### Implementación con Supabase

```typescript
// Row Level Security (RLS) Policies
// En Supabase SQL Editor:

-- Política para transacciones
CREATE POLICY "Users can view transactions based on role"
ON transactions FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE is_active = true
  )
);

CREATE POLICY "Only admins and treasurers can insert transactions"
ON transactions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'treasurer')
  )
);
```

## 📁 Estructura de Carpetas del Proyecto

```
saestl-app/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── raffles/
│   │   │   ├── events/
│   │   │   ├── budgets/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── transactions/
│   │   │   ├── raffles/
│   │   │   ├── events/
│   │   │   ├── budgets/
│   │   │   └── reports/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── raffles/
│   │   ├── events/
│   │   ├── charts/
│   │   └── layout/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── utils.ts
│   │   ├── validations/
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── use-transactions.ts
│   │   ├── use-raffles.ts
│   │   └── use-auth.ts
│   ├── types/
│   │   └── database.types.ts
│   └── stores/
│       └── auth-store.ts
├── prisma/ (opcional)
│   └── schema.prisma
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🔄 Flujo de Datos

### Ejemplo: Crear una Transacción

```
1. Usuario llena formulario → Validación con Zod
                              ↓
2. Submit → Server Action o API Route
                              ↓
3. Validación de permisos (middleware)
                              ↓
4. Inserción en Supabase → PostgreSQL
                              ↓
5. Real-time update → Otros clientes conectados
                              ↓
6. Actualización UI → React re-render
                              ↓
7. Auditoría → Registro en audit_log
```

## 🎨 Patrones de Diseño

### 1. **Repository Pattern** (para acceso a datos)
```typescript
// lib/repositories/transaction-repository.ts
export class TransactionRepository {
  async create(data: TransactionInput) { }
  async findAll(filters: Filters) { }
  async findById(id: string) { }
  async update(id: string, data: Partial<TransactionInput>) { }
  async delete(id: string) { }
}
```

### 2. **Service Layer** (lógica de negocio)
```typescript
// lib/services/transaction-service.ts
export class TransactionService {
  async createTransaction(data: TransactionInput) {
    // Validaciones
    // Actualizar balance
    // Verificar presupuesto
    // Crear auditoría
  }
}
```

### 3. **Custom Hooks** (para componentes)
```typescript
// hooks/use-transactions.ts
export function useTransactions(filters?: Filters) {
  const { data, error, isLoading } = useSWR(
    ['/api/transactions', filters],
    fetcher
  )
  return { transactions: data, error, isLoading }
}
```

## 🚀 Características Avanzadas

### 1. **Real-time con Supabase**
- Updates en vivo del dashboard
- Notificaciones de nuevas transacciones
- Sincronización multi-usuario

### 2. **PWA (Progressive Web App)**
- Funciona offline
- Instalable en móvil
- Notificaciones push

### 3. **Optimización de Rendimiento**
- Server Components de Next.js 14
- Lazy loading de componentes
- Image optimization
- Cacheo con SWR o React Query

### 4. **Seguridad**
- Row Level Security en Supabase
- Validación en cliente y servidor
- Sanitización de inputs
- Rate limiting en API
- HTTPS obligatorio

## 📊 Monitoreo y Analytics

### Herramientas sugeridas:
- **Vercel Analytics**: Rendimiento del frontend
- **Supabase Dashboard**: Queries y uso de DB
- **Sentry** (opcional): Tracking de errores
- **PostHog** (opcional): Analytics de uso

## 🔧 Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://user:pass@railway.app:port/db
```

## 🧪 Testing (Recomendado para futuro)

- **Unit Tests**: Vitest
- **Integration Tests**: Playwright
- **E2E Tests**: Playwright

## 📱 Responsive Design

La aplicación debe ser completamente responsive:
- **Desktop**: Dashboard completo con sidebar
- **Tablet**: Menú colapsable
- **Mobile**: Bottom navigation, formularios optimizados

## 🎯 Principios de Arquitectura

1. **Separation of Concerns**: Separar UI, lógica y datos
2. **DRY (Don't Repeat Yourself)**: Componentes reutilizables
3. **SOLID Principles**: Código mantenible
4. **Security First**: Validación en cada capa
5. **Performance**: Lazy loading, code splitting
6. **Accessibility**: ARIA labels, keyboard navigation

---

Esta arquitectura te permitirá escalar el proyecto fácilmente y mantenerlo a largo plazo.