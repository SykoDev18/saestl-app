'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  Clock,
  Phone,
  Mail,
  Download,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportToExcel, exportToCSV } from '@/lib/utils/export'
import type { EventStatus } from '@/types/database.types'

// Mock data - replace with useEvent hook when connected to Supabase
const mockEvent: {
  id: string
  name: string
  description: string
  event_type: string
  event_date: string
  location: string
  ticket_price: number
  max_capacity: number
  registration_deadline: string
  status: EventStatus
  created_at: string
} = {
  id: '1',
  name: 'Torneo de FIFA 2026',
  description: 'Torneo interescolar de FIFA 26 con premios',
  event_type: 'torneo',
  event_date: '2026-02-14',
  location: 'Auditorio Principal ESTl',
  ticket_price: 50,
  max_capacity: 32,
  registration_deadline: '2026-02-10',
  status: 'upcoming',
  created_at: '2026-01-20',
}

const mockRegistrations = [
  { id: '1', participant_name: 'Juan Pérez', participant_email: 'juan@email.com', participant_phone: '7711234567', registration_date: '2026-01-20', payment_status: 'paid', attendance_status: 'registered' },
  { id: '2', participant_name: 'María García', participant_email: 'maria@email.com', participant_phone: '7719876543', registration_date: '2026-01-21', payment_status: 'paid', attendance_status: 'registered' },
  { id: '3', participant_name: 'Carlos López', participant_email: 'carlos@email.com', participant_phone: '7715551234', registration_date: '2026-01-22', payment_status: 'pending', attendance_status: 'registered' },
  { id: '4', participant_name: 'Ana Martínez', participant_email: 'ana@email.com', participant_phone: '7718889999', registration_date: '2026-01-23', payment_status: 'paid', attendance_status: 'registered' },
  { id: '5', participant_name: 'Roberto Sánchez', participant_email: 'roberto@email.com', participant_phone: '7712223333', registration_date: '2026-01-24', payment_status: 'paid', attendance_status: 'registered' },
  { id: '6', participant_name: 'Laura Torres', participant_email: 'laura@email.com', participant_phone: '7714445555', registration_date: '2026-01-25', payment_status: 'paid', attendance_status: 'registered' },
  { id: '7', participant_name: 'Pedro Ramírez', participant_email: 'pedro@email.com', participant_phone: '7716667777', registration_date: '2026-01-26', payment_status: 'pending', attendance_status: 'registered' },
  { id: '8', participant_name: 'Sofía Hernández', participant_email: 'sofia@email.com', participant_phone: '7718889000', registration_date: '2026-01-27', payment_status: 'paid', attendance_status: 'registered' },
]

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  // State
  const [event, setEvent] = useState(mockEvent)
  const [registrations, setRegistrations] = useState(mockRegistrations)
  const [searchTerm, setSearchTerm] = useState('')
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false)
  const [attendanceMode, setAttendanceMode] = useState(false)
  
  // Form state
  const [regForm, setRegForm] = useState({
    participantName: '',
    participantEmail: '',
    participantPhone: '',
  })

  // Calculations
  const totalRegistrations = registrations.length
  const paidCount = registrations.filter(r => r.payment_status === 'paid').length
  const pendingPayments = registrations.filter(r => r.payment_status === 'pending').length
  const attendedCount = registrations.filter(r => r.attendance_status === 'attended').length
  const availableSpots = event.max_capacity ? event.max_capacity - totalRegistrations : 999
  const totalRevenue = paidCount * (event.ticket_price || 0)
  const capacityPercent = event.max_capacity ? (totalRegistrations / event.max_capacity) * 100 : 0

  // Filter registrations
  const filteredRegistrations = registrations.filter(reg => 
    reg.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.participant_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.participant_phone.includes(searchTerm)
  )

  // Handlers
  const handleRegister = () => {
    const newReg = {
      id: `new-${Date.now()}`,
      participant_name: regForm.participantName,
      participant_email: regForm.participantEmail,
      participant_phone: regForm.participantPhone,
      registration_date: new Date().toISOString().split('T')[0],
      payment_status: 'pending' as const,
      attendance_status: 'registered' as const,
    }

    setRegistrations(prev => [newReg, ...prev])
    setRegisterDialogOpen(false)
    setRegForm({ participantName: '', participantEmail: '', participantPhone: '' })
  }

  const handlePaymentToggle = (id: string) => {
    setRegistrations(prev => prev.map(r => 
      r.id === id 
        ? { ...r, payment_status: r.payment_status === 'paid' ? 'pending' : 'paid' }
        : r
    ))
  }

  const handleAttendanceToggle = (id: string, status: 'attended' | 'absent') => {
    setRegistrations(prev => prev.map(r => 
      r.id === id ? { ...r, attendance_status: status } : r
    ))
  }

  const handleExport = (format: 'excel' | 'csv') => {
    const exportData = registrations.map(r => ({
      'Nombre': r.participant_name,
      'Email': r.participant_email,
      'Teléfono': r.participant_phone,
      'Fecha Registro': r.registration_date,
      'Pago': r.payment_status === 'paid' ? 'Pagado' : 'Pendiente',
      'Asistencia': r.attendance_status === 'attended' ? 'Asistió' : r.attendance_status === 'absent' ? 'No asistió' : 'Registrado',
    }))

    if (format === 'excel') {
      exportToExcel(exportData, `registros-${event.name}`)
    } else {
      exportToCSV(exportData, `registros-${event.name}`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Próximo</Badge>
      case 'ongoing':
        return <Badge className="bg-green-100 text-green-800">En Curso</Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completado</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getEventTypeBadge = (type: string) => {
    const types: Record<string, { label: string; className: string }> = {
      torneo: { label: '🎮 Torneo', className: 'bg-purple-100 text-purple-800' },
      conferencia: { label: '🎤 Conferencia', className: 'bg-blue-100 text-blue-800' },
      fiesta: { label: '🎉 Fiesta', className: 'bg-pink-100 text-pink-800' },
      taller: { label: '🛠️ Taller', className: 'bg-orange-100 text-orange-800' },
    }
    const t = types[type] || { label: type, className: 'bg-gray-100 text-gray-800' }
    return <Badge className={t.className}>{t.label}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{event.name}</h1>
              {getEventTypeBadge(event.event_type)}
            </div>
            <p className="text-muted-foreground">{event.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(event.status)}
          {event.status === 'upcoming' && availableSpots > 0 && (
            <Button onClick={() => setRegisterDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Participante
            </Button>
          )}
          {event.status === 'ongoing' && (
            <Button 
              variant={attendanceMode ? 'default' : 'outline'}
              onClick={() => setAttendanceMode(!attendanceMode)}
              className={attendanceMode ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              {attendanceMode ? 'Modo Asistencia Activo' : 'Tomar Asistencia'}
            </Button>
          )}
        </div>
      </div>

      {/* Event Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="font-semibold">{event.event_date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ubicación</p>
                <p className="font-semibold">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precio</p>
                <p className="font-semibold">${event.ticket_price || 'Gratis'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Límite Registro</p>
                <p className="font-semibold">{event.registration_deadline}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Registrados
            </CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalRegistrations} / {event.max_capacity || '∞'}</p>
            {event.max_capacity && (
              <>
                <Progress value={capacityPercent} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {availableSpots} lugares disponibles
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {paidCount} pagos recibidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagos Pendientes
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{pendingPayments}</p>
            <p className="text-xs text-muted-foreground">
              ${pendingPayments * (event.ticket_price || 0)} por cobrar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Asistencia
            </CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{attendedCount}</p>
            <p className="text-xs text-muted-foreground">
              {totalRegistrations > 0 ? ((attendedCount / totalRegistrations) * 100).toFixed(0) : 0}% asistencia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Participantes Registrados</CardTitle>
              <CardDescription>
                {totalRegistrations} participantes registrados
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar participante..."
                  className="pl-10 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={() => handleExport('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Asistencia</TableHead>
                {attendanceMode && <TableHead>Acción</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell className="font-medium">{reg.participant_name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {reg.participant_email}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {reg.participant_phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{reg.registration_date}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePaymentToggle(reg.id)}
                      className={reg.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}
                    >
                      {reg.payment_status === 'paid' ? (
                        <><CheckCircle className="h-4 w-4 mr-1" /> Pagado</>
                      ) : (
                        <><AlertCircle className="h-4 w-4 mr-1" /> Pendiente</>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {reg.attendance_status === 'attended' ? (
                      <Badge className="bg-green-100 text-green-800">
                        <UserCheck className="h-3 w-3 mr-1" /> Asistió
                      </Badge>
                    ) : reg.attendance_status === 'absent' ? (
                      <Badge className="bg-red-100 text-red-800">
                        <UserX className="h-3 w-3 mr-1" /> No asistió
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Registrado</Badge>
                    )}
                  </TableCell>
                  {attendanceMode && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 text-green-700 hover:bg-green-100"
                          onClick={() => handleAttendanceToggle(reg.id, 'attended')}
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-red-50 text-red-700 hover:bg-red-100"
                          onClick={() => handleAttendanceToggle(reg.id, 'absent')}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredRegistrations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={attendanceMode ? 6 : 5} className="text-center py-8 text-muted-foreground">
                    No se encontraron participantes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Register Dialog */}
      <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Participante</DialogTitle>
            <DialogDescription>
              Agrega un nuevo participante al evento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre Completo</Label>
              <Input
                value={regForm.participantName}
                onChange={(e) => setRegForm(prev => ({ ...prev, participantName: e.target.value }))}
                placeholder="Nombre del participante"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={regForm.participantEmail}
                onChange={(e) => setRegForm(prev => ({ ...prev, participantEmail: e.target.value }))}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={regForm.participantPhone}
                onChange={(e) => setRegForm(prev => ({ ...prev, participantPhone: e.target.value }))}
                placeholder="771 123 4567"
              />
            </div>
            {event.ticket_price && event.ticket_price > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  Este evento tiene un costo de <strong>${event.ticket_price}</strong>
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleRegister}
              disabled={!regForm.participantName || !regForm.participantEmail || !regForm.participantPhone}
            >
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
