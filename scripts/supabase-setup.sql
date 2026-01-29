-- ============================================
-- SISTEMA DE GESTIÓN SAESTL - BASE DE DATOS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- TABLA: users (usuarios del sistema)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'treasurer', 'president', 'secretary', 'viewer')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: categories (categorías de ingresos/egresos)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: transactions (movimientos de dinero)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  description TEXT NOT NULL,
  date DATE NOT NULL,
  payment_method VARCHAR(50),
  receipt_url TEXT,
  responsible_user_id UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: budgets (presupuestos)
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id),
  amount DECIMAL(10, 2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: raffles (rifas)
CREATE TABLE IF NOT EXISTS raffles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ticket_price DECIMAL(10, 2) NOT NULL,
  total_tickets INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  draw_date DATE,
  prize_description TEXT,
  winner_ticket_number INTEGER,
  winner_name VARCHAR(255),
  winner_phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'drawn')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: raffle_tickets (boletos de rifa)
CREATE TABLE IF NOT EXISTS raffle_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
  ticket_number INTEGER NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(20),
  buyer_email VARCHAR(255),
  sold_by UUID REFERENCES users(id),
  sale_date DATE NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(raffle_id, ticket_number)
);

-- TABLA: events (eventos)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50),
  event_date DATE NOT NULL,
  location VARCHAR(255),
  ticket_price DECIMAL(10, 2),
  max_capacity INTEGER,
  registration_deadline DATE,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: event_registrations (registros a eventos)
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_name VARCHAR(255) NOT NULL,
  participant_email VARCHAR(255) NOT NULL,
  participant_phone VARCHAR(20) NOT NULL,
  registration_date TIMESTAMP DEFAULT NOW(),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending')),
  attendance_status VARCHAR(20) DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'absent')),
  notes TEXT,
  registered_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: monthly_reports (informes mensuales)
CREATE TABLE IF NOT EXISTS monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  total_income DECIMAL(10, 2) DEFAULT 0,
  total_expense DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2) DEFAULT 0,
  report_data JSONB,
  generated_by UUID REFERENCES users(id),
  generated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(month, year)
);

-- TABLA: accounts_payable (cuentas por pagar)
CREATE TABLE IF NOT EXISTS accounts_payable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  creditor_name VARCHAR(255) NOT NULL,
  creditor_contact VARCHAR(255),
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  paid_date DATE,
  paid_transaction_id UUID REFERENCES transactions(id),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: accounts_receivable (cuentas por cobrar)
CREATE TABLE IF NOT EXISTS accounts_receivable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  debtor_name VARCHAR(255) NOT NULL,
  debtor_contact VARCHAR(255),
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'collected', 'overdue')),
  collected_date DATE,
  collected_transaction_id UUID REFERENCES transactions(id),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: audit_log (registro de auditoría)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_raffle ON raffle_tickets(raffle_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name, record_id);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios autenticados (pueden ver y modificar todo)
CREATE POLICY "Users can view all users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage categories" ON categories FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view transactions" ON transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage transactions" ON transactions FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view budgets" ON budgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage budgets" ON budgets FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view raffles" ON raffles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage raffles" ON raffles FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view raffle_tickets" ON raffle_tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage raffle_tickets" ON raffle_tickets FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view events" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage events" ON events FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view event_registrations" ON event_registrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage event_registrations" ON event_registrations FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view monthly_reports" ON monthly_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage monthly_reports" ON monthly_reports FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view accounts_payable" ON accounts_payable FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage accounts_payable" ON accounts_payable FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view accounts_receivable" ON accounts_receivable FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage accounts_receivable" ON accounts_receivable FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view audit_log" ON audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert audit_log" ON audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- DATOS INICIALES (SEED)
-- ============================================

-- Categorías de ingreso
INSERT INTO categories (name, type, description, color) VALUES
('Cuotas de Alumnos', 'income', 'Cuotas semestrales o mensuales', '#10b981'),
('Rifas', 'income', 'Ingresos por venta de boletos de rifa', '#3b82f6'),
('Eventos', 'income', 'Venta de entradas a eventos', '#8b5cf6'),
('Donaciones', 'income', 'Donaciones de empresas o personas', '#f59e0b'),
('Patrocinios', 'income', 'Patrocinios de eventos', '#06b6d4')
ON CONFLICT DO NOTHING;

-- Categorías de egreso
INSERT INTO categories (name, type, description, color) VALUES
('Material de Oficina', 'expense', 'Papelería, impresiones, etc.', '#ef4444'),
('Eventos', 'expense', 'Gastos en organización de eventos', '#f97316'),
('Premios de Rifas', 'expense', 'Compra de premios para rifas', '#ec4899'),
('Servicios', 'expense', 'Servicios contratados', '#6366f1'),
('Mantenimiento', 'expense', 'Mantenimiento de espacios', '#14b8a6'),
('Otros', 'expense', 'Gastos diversos', '#64748b')
ON CONFLICT DO NOTHING;
