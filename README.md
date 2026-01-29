This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
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

1. **Clona el repositorio:**
```bash
git clone https://github.com/SykoDev18/saestl-app.git
cd saestl-app
```

2. **Instala las dependencias:**
```bash
npm install
```

3. **Configura las variables de entorno:**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
DATABASE_URL=tu_url_de_railway
```

4. **Ejecuta la base de datos:**
   - Crea un proyecto en [Supabase](https://supabase.com)
   - Ejecuta el script SQL en `Docs/db_structure.sql`

5. **Inicia el servidor de desarrollo:**
```bash
npm run dev
```

6. **Abre** [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
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
├── lib/
│   ├── supabase/         # Configuración de Supabase
│   ├── validations/      # Esquemas de validación Zod
│   ├── constants.ts      # Constantes del sistema
│   └── utils.ts
├── types/
│   └── database.types.ts # Tipos TypeScript
└── Docs/                 # Documentación del proyecto
```

## 🔐 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso total al sistema |
| **Tesorero** | Gestión financiera completa |
| **Presidente** | Aprobación de gastos, visualización |
| **Secretario** | Gestión de eventos y registros |
| **Visualizador** | Solo lectura |

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
