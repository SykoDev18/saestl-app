// Tipos generados basados en la estructura de la base de datos SAESTL

export type UserRole = 'admin' | 'treasurer' | 'president' | 'secretary' | 'viewer'
export type TransactionType = 'income' | 'expense'
export type TransactionStatus = 'pending' | 'approved' | 'rejected'
export type CategoryType = 'income' | 'expense'
export type RaffleStatus = 'active' | 'closed' | 'drawn'
export type PaymentStatus = 'paid' | 'pending'
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
export type AttendanceStatus = 'registered' | 'attended' | 'absent'
export type AccountStatus = 'pending' | 'paid' | 'overdue' | 'collected'

export interface User {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  type: CategoryType
  description: string | null
  color: string | null
  is_active: boolean
  created_at: string
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category_id: string | null
  description: string
  date: string
  payment_method: string | null
  receipt_url: string | null
  responsible_user_id: string | null
  created_by: string | null
  approved_by: string | null
  status: TransactionStatus
  notes: string | null
  created_at: string
  updated_at: string
  // Relations
  category?: Category
  responsible_user?: User
  created_by_user?: User
  approved_by_user?: User
}

export interface Budget {
  id: string
  name: string
  category_id: string | null
  amount: number
  period_start: string
  period_end: string
  description: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Relations
  category?: Category
  created_by_user?: User
}

export interface Raffle {
  id: string
  name: string
  description: string | null
  ticket_price: number
  total_tickets: number
  start_date: string
  end_date: string
  draw_date: string | null
  prize_description: string | null
  winner_ticket_number: number | null
  winner_name: string | null
  winner_phone: string | null
  status: RaffleStatus
  created_by: string | null
  created_at: string
  updated_at: string
  // Relations
  tickets?: RaffleTicket[]
  created_by_user?: User
}

export interface RaffleTicket {
  id: string
  raffle_id: string
  ticket_number: number
  buyer_name: string
  buyer_phone: string | null
  buyer_email: string | null
  sold_by: string | null
  sale_date: string
  payment_status: PaymentStatus
  created_at: string
  // Relations
  raffle?: Raffle
  sold_by_user?: User
}

export interface Event {
  id: string
  name: string
  description: string | null
  event_type: string | null
  event_date: string
  location: string | null
  ticket_price: number | null
  max_capacity: number | null
  registration_deadline: string | null
  status: EventStatus
  created_by: string | null
  created_at: string
  updated_at: string
  // Relations
  registrations?: EventRegistration[]
  created_by_user?: User
}

export interface EventRegistration {
  id: string
  event_id: string
  participant_name: string
  participant_email: string
  participant_phone: string
  registration_date: string
  payment_status: PaymentStatus
  attendance_status: AttendanceStatus
  notes: string | null
  registered_by: string | null
  created_at: string
  // Relations
  event?: Event
  registered_by_user?: User
}

export interface MonthlyReport {
  id: string
  month: number
  year: number
  total_income: number
  total_expense: number
  balance: number
  report_data: Record<string, unknown> | null
  generated_by: string | null
  generated_at: string
  // Relations
  generated_by_user?: User
}

export interface AccountPayable {
  id: string
  description: string
  amount: number
  creditor_name: string
  creditor_contact: string | null
  due_date: string
  status: 'pending' | 'paid' | 'overdue'
  paid_date: string | null
  paid_transaction_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Relations
  paid_transaction?: Transaction
  created_by_user?: User
}

export interface AccountReceivable {
  id: string
  description: string
  amount: number
  debtor_name: string
  debtor_contact: string | null
  due_date: string
  status: 'pending' | 'collected' | 'overdue'
  collected_date: string | null
  collected_transaction_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Relations
  collected_transaction?: Transaction
  created_by_user?: User
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  table_name: string
  record_id: string
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  // Relations
  user?: User
}

// Database type for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id'>>
      }
      transactions: {
        Row: Transaction
        Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'category' | 'responsible_user' | 'created_by_user' | 'approved_by_user'>
        Update: Partial<Omit<Transaction, 'id' | 'category' | 'responsible_user' | 'created_by_user' | 'approved_by_user'>>
      }
      budgets: {
        Row: Budget
        Insert: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'category' | 'created_by_user'>
        Update: Partial<Omit<Budget, 'id' | 'category' | 'created_by_user'>>
      }
      raffles: {
        Row: Raffle
        Insert: Omit<Raffle, 'id' | 'created_at' | 'updated_at' | 'tickets' | 'created_by_user'>
        Update: Partial<Omit<Raffle, 'id' | 'tickets' | 'created_by_user'>>
      }
      raffle_tickets: {
        Row: RaffleTicket
        Insert: Omit<RaffleTicket, 'id' | 'created_at' | 'raffle' | 'sold_by_user'>
        Update: Partial<Omit<RaffleTicket, 'id' | 'raffle' | 'sold_by_user'>>
      }
      events: {
        Row: Event
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'registrations' | 'created_by_user'>
        Update: Partial<Omit<Event, 'id' | 'registrations' | 'created_by_user'>>
      }
      event_registrations: {
        Row: EventRegistration
        Insert: Omit<EventRegistration, 'id' | 'created_at' | 'event' | 'registered_by_user'>
        Update: Partial<Omit<EventRegistration, 'id' | 'event' | 'registered_by_user'>>
      }
      monthly_reports: {
        Row: MonthlyReport
        Insert: Omit<MonthlyReport, 'id' | 'generated_by_user'>
        Update: Partial<Omit<MonthlyReport, 'id' | 'generated_by_user'>>
      }
      accounts_payable: {
        Row: AccountPayable
        Insert: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at' | 'paid_transaction' | 'created_by_user'>
        Update: Partial<Omit<AccountPayable, 'id' | 'paid_transaction' | 'created_by_user'>>
      }
      accounts_receivable: {
        Row: AccountReceivable
        Insert: Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at' | 'collected_transaction' | 'created_by_user'>
        Update: Partial<Omit<AccountReceivable, 'id' | 'collected_transaction' | 'created_by_user'>>
      }
      audit_log: {
        Row: AuditLog
        Insert: Omit<AuditLog, 'id' | 'created_at' | 'user'>
        Update: never
      }
    }
    Views: {
      current_balance: {
        Row: {
          total_income: number
          total_expense: number
          balance: number
        }
      }
      current_month_transactions: {
        Row: Transaction
      }
    }
  }
}
