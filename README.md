# 🎓 SAESTL - Sistema de Gestión Financiera

Sistema de Gestión Financiera para la Sociedad de Alumnos de la Escuela Superior de Tlahuelilpan (UAEH).

## 🚀 Características

- **Dashboard** con métricas en tiempo real (balance, ingresos, egresos)
- **Gestión de Transacciones** - Registra ingresos y egresos con categorías
- **Gestión de Rifas** - Administra boletos y sorteos
- **Gestión de Eventos** - Organiza eventos y registros de participantes
- **Presupuestos** - Planifica y controla gastos por categoría
- **Reportes** - Genera informes mensuales y exporta a Excel/CSV
- **Cuentas por Cobrar/Pagar** - Control de deudas y créditos
- **Sistema de Roles** - Admin, Tesorero, Presidente, Secretario, Visualizador

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui
- **Gráficas:** Recharts
- **Formularios:** React Hook Form + Zod
- **Backend:** Supabase (Auth, Database, Storage)
- **Base de Datos:** PostgreSQL (Railway)

## 📦 Instalación

### 1. Clona el repositorio

```bash
git clone https://github.com/SykoDev18/saestl-app.git
cd saestl-app
```

### 2. Instala las dependencias

```bash
npm install
```

### 3. Configura las variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
DATABASE_URL=tu_url_de_railway
```

### 4. Ejecuta la base de datos

- Crea un proyecto en [Supabase](https://supabase.com)
- Ejecuta el script SQL en `Docs/db_structure.sql`

### 5. Inicia el servidor de desarrollo

```bash
npm run dev
```

### 6. Abre el navegador

Visita [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 📁 Estructura del Proyecto

```text
saestl-app/
├── app/                    # Rutas y páginas (App Router)
│   ├── (auth)/            # Páginas de autenticación
│   │   └── login/
│   ├── (dashboard)/       # Páginas protegidas del dashboard
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── raffles/
│   │   ├── events/
│   │   ├── budgets/
│   │   ├── reports/
│   │   ├── accounts/
│   │   └── settings/
│   └── layout.tsx
├── components/
│   ├── dashboard/         # Componentes del dashboard
│   ├── layout/            # Sidebar, Header, Navigation
│   └── ui/               # Componentes shadcn/ui
├── hooks/                 # Custom React Hooks
│   ├── use-auth.ts
│   ├── use-transactions.ts
│   ├── use-raffles.ts
│   └── use-events.ts
├── lib/
│   ├── supabase/         # Configuración de Supabase
│   ├── validations/      # Esquemas de validación Zod
│   ├── utils/            # Utilidades (export, etc.)
│   ├── constants.ts      # Constantes del sistema
│   ├── error-handler.ts  # Manejo de errores
│   └── utils.ts
├── types/
│   └── database.types.ts # Tipos TypeScript
└── Docs/                 # Documentación del proyecto
```

## 🔐 Roles y Permisos

| Rol              | Permisos                           |
| ---------------- | ---------------------------------- |
| **Admin**        | Acceso total al sistema            |
| **Tesorero**     | Gestión financiera completa        |
| **Presidente**   | Aprobación de gastos, visualización|
| **Secretario**   | Gestión de eventos y registros     |
| **Visualizador** | Solo lectura                       |

## 📊 Base de Datos

El esquema completo de la base de datos está en `Docs/db_structure.sql` e incluye:

- `users` - Usuarios del sistema
- `categories` - Categorías de ingresos/egresos
- `transactions` - Movimientos financieros
- `raffles` / `raffle_tickets` - Gestión de rifas
- `events` / `event_registrations` - Gestión de eventos
- `budgets` - Presupuestos
- `accounts_payable` / `accounts_receivable` - Cuentas
- `monthly_reports` - Informes mensuales
- `audit_log` - Registro de auditoría

## 🎨 Paleta de Colores

- **Primario:** Blue-600 (#2563eb)
- **Ingresos:** Green-500 (#22c55e)
- **Egresos:** Red-500 (#ef4444)
- **Rifas:** Purple-500 (#a855f7)
- **Eventos:** Orange-500 (#f97316)

## 📱 Responsive

La aplicación está optimizada para:

- 📱 Móvil (bottom navigation)
- 💻 Tablet (sidebar colapsable)
- 🖥️ Desktop (sidebar fijo)

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático con cada push

## 📄 Licencia

Este proyecto fue desarrollado para la Sociedad de Alumnos de la Escuela Superior de Tlahuelilpan (SAESTL) - UAEH.

## 👨‍💻 Autor

Desarrollado por el equipo de SAESTL - 2026
