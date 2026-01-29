-- ============================================
-- SISTEMA DE GESTIÓN SAESTL - BASE DE DATOS
-- ============================================

-- TABLA: users (usuarios del sistema)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'treasurer', 'president', 'secretary', 'viewer')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: categories (categorías de ingresos/egresos)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  color VARCHAR(7), -- Color hexadecimal para gráficas
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: transactions (movimientos de dinero)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  description TEXT NOT NULL,
  date DATE NOT NULL,
  payment_method VARCHAR(50), -- efectivo, transferencia, tarjeta
  receipt_url TEXT, -- URL de la foto del comprobante
  responsible_user_id UUID REFERENCES users(id), -- Quién gastó o registró
  created_by UUID REFERENCES users(id), -- Quién creó el registro
  approved_by UUID REFERENCES users(id), -- Quién aprobó (para gastos grandes)
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: budgets (presupuestos)
CREATE TABLE budgets (
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
CREATE TABLE raffles (
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
CREATE TABLE raffle_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
  ticket_number INTEGER NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(20),
  buyer_email VARCHAR(255),
  sold_by UUID REFERENCES users(id), -- Quién vendió el boleto
  sale_date DATE NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(raffle_id, ticket_number)
);

-- TABLA: events (eventos)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50), -- conferencia, torneo, fiesta, etc.
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
CREATE TABLE event_registrations (
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
CREATE TABLE monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  total_income DECIMAL(10, 2) DEFAULT 0,
  total_expense DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2) DEFAULT 0,
  report_data JSONB, -- Datos detallados del reporte
  generated_by UUID REFERENCES users(id),
  generated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(month, year)
);

-- TABLA: accounts_payable (cuentas por pagar)
CREATE TABLE accounts_payable (
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
CREATE TABLE accounts_receivable (
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
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- create, update, delete, approve, etc.
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

CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_created_by ON transactions(created_by);
CREATE INDEX idx_raffle_tickets_raffle ON raffle_tickets(raffle_id);
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_table ON audit_log(table_name, record_id);

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de balance actual
CREATE VIEW current_balance AS
SELECT 
  COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
  COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
  COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance
FROM transactions
WHERE status = 'approved';

-- Vista de transacciones del mes actual
CREATE VIEW current_month_transactions AS
SELECT *
FROM transactions
WHERE EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND status = 'approved';

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_raffles_updated_at BEFORE UPDATE ON raffles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- DATOS INICIALES (SEED)
-- ============================================

-- Categorías de ingreso
INSERT INTO categories (name, type, description, color) VALUES
('Cuotas de Alumnos', 'income', 'Cuotas semestrales o mensuales', '#10b981'),
('Rifas', 'income', 'Ingresos por venta de boletos de rifa', '#3b82f6'),
('Eventos', 'income', 'Venta de entradas a eventos', '#8b5cf6'),
('Donaciones', 'income', 'Donaciones de empresas o personas', '#f59e0b'),
('Patrocinios', 'income', 'Patrocinios de eventos', '#06b6d4');

-- Categorías de egreso
INSERT INTO categories (name, type, description, color) VALUES
('Material de Oficina', 'expense', 'Papelería, impresiones, etc.', '#ef4444'),
('Eventos', 'expense', 'Gastos en organización de eventos', '#f97316'),
('Premios de Rifas', 'expense', 'Compra de premios para rifas', '#ec4899'),
('Servicios', 'expense', 'Servicios contratados', '#6366f1'),
('Mantenimiento', 'expense', 'Mantenimiento de espacios', '#14b8a6'),
('Otros', 'expense', 'Gastos diversos', '#64748b');