import * as XLSX from 'xlsx'
import Papa from 'papaparse'

/**
 * Export data to Excel file
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 */
export const exportToExcel = (data: Record<string, unknown>[], filename: string) => {
  try {
    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(data)
    
    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')
    
    // Auto-size columns
    const maxWidth = 50
    const colWidths = Object.keys(data[0] || {}).map(key => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      )
      return { wch: Math.min(maxLength + 2, maxWidth) }
    })
    worksheet['!cols'] = colWidths
    
    // Generate and download file
    XLSX.writeFile(workbook, `${filename}.xlsx`)
    
    return { success: true }
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    return { success: false, error: 'Error al exportar a Excel' }
  }
}

/**
 * Export data to CSV file
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 */
export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  try {
    // Convert to CSV using PapaParse
    const csv = Papa.unparse(data)
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return { success: true }
  } catch (error) {
    console.error('Error exporting to CSV:', error)
    return { success: false, error: 'Error al exportar a CSV' }
  }
}

/**
 * Export data to PDF (placeholder - needs jspdf library)
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 * @param title - Title for the PDF document
 */
export const exportToPDF = async (
  data: Record<string, unknown>[], 
  filename: string,
  title?: string
) => {
  // For PDF export, you would need to install jspdf and jspdf-autotable
  // npm install jspdf jspdf-autotable
  console.log('PDF export not implemented. Install jspdf for PDF support.')
  console.log('Data to export:', data, 'Filename:', filename, 'Title:', title)
  return { success: false, error: 'PDF export not implemented' }
}

/**
 * Format currency for export
 * @param amount - Number to format
 * @param currency - Currency code (default: MXN)
 */
export const formatCurrencyForExport = (amount: number, currency = 'MXN'): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format date for export
 * @param date - Date string or Date object
 * @param format - Format type
 */
export const formatDateForExport = (
  date: string | Date, 
  format: 'short' | 'long' | 'iso' = 'short'
): string => {
  const d = new Date(date)
  
  switch (format) {
    case 'long':
      return d.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    case 'iso':
      return d.toISOString().split('T')[0]
    default:
      return d.toLocaleDateString('es-MX')
  }
}

/**
 * Prepare transactions data for export
 */
export const prepareTransactionsForExport = (transactions: {
  type: string
  amount: number
  description: string
  date: string
  category?: { name: string }
  status: string
}[]) => {
  return transactions.map(t => ({
    'Tipo': t.type === 'income' ? 'Ingreso' : 'Egreso',
    'Monto': formatCurrencyForExport(t.amount),
    'Descripción': t.description,
    'Categoría': t.category?.name || 'Sin categoría',
    'Fecha': formatDateForExport(t.date),
    'Estado': t.status === 'approved' ? 'Aprobado' : t.status === 'pending' ? 'Pendiente' : 'Rechazado',
  }))
}

/**
 * Prepare raffle tickets for export
 */
export const prepareTicketsForExport = (tickets: {
  ticket_number: number
  buyer_name: string
  buyer_phone?: string
  buyer_email?: string
  sale_date: string
  payment_status: string
}[]) => {
  return tickets.map(t => ({
    'Número': t.ticket_number,
    'Comprador': t.buyer_name,
    'Teléfono': t.buyer_phone || '',
    'Email': t.buyer_email || '',
    'Fecha Venta': formatDateForExport(t.sale_date),
    'Estado Pago': t.payment_status === 'paid' ? 'Pagado' : 'Pendiente',
  }))
}

/**
 * Prepare event registrations for export
 */
export const prepareRegistrationsForExport = (registrations: {
  participant_name: string
  participant_email: string
  participant_phone: string
  registration_date: string
  payment_status: string
  attendance_status: string
}[]) => {
  return registrations.map(r => ({
    'Nombre': r.participant_name,
    'Email': r.participant_email,
    'Teléfono': r.participant_phone,
    'Fecha Registro': formatDateForExport(r.registration_date),
    'Pago': r.payment_status === 'paid' ? 'Pagado' : 'Pendiente',
    'Asistencia': r.attendance_status === 'attended' ? 'Asistió' : r.attendance_status === 'absent' ? 'No asistió' : 'Registrado',
  }))
}

/**
 * Prepare monthly report for export
 */
export const prepareMonthlyReportForExport = (report: {
  month: number
  year: number
  total_income: number
  total_expense: number
  balance: number
  transactions?: {
    type: string
    amount: number
    description: string
    date: string
  }[]
}) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  
  const summary = [{
    'Período': `${months[report.month - 1]} ${report.year}`,
    'Total Ingresos': formatCurrencyForExport(report.total_income),
    'Total Egresos': formatCurrencyForExport(report.total_expense),
    'Balance': formatCurrencyForExport(report.balance),
  }]
  
  return {
    summary,
    transactions: report.transactions?.map(t => ({
      'Tipo': t.type === 'income' ? 'Ingreso' : 'Egreso',
      'Monto': formatCurrencyForExport(t.amount),
      'Descripción': t.description,
      'Fecha': formatDateForExport(t.date),
    })) || [],
  }
}
