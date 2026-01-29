import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users } from 'lucide-react'
import Link from 'next/link'

interface Event {
  id: string
  name: string
  date: string
  location: string
  registrations: number
  max_capacity: number
  status: 'upcoming' | 'ongoing'
}

interface UpcomingEventsProps {
  events?: Event[]
}

// Eventos de SAESTI 2026
const defaultEvents: Event[] = [
  {
    id: '1',
    name: 'Evento Teo (Ya realizado)',
    date: '2026-01-28',
    location: 'ESTI Campus',
    registrations: 6080,
    max_capacity: 6080,
    status: 'ongoing',
  },
  {
    id: '2',
    name: 'Operación Lockers',
    date: '2026-02-01',
    location: 'Edificio Principal',
    registrations: 33,
    max_capacity: 50,
    status: 'upcoming',
  },
  {
    id: '3',
    name: 'Venta de Agua y Servicios',
    date: '2026-02-05',
    location: 'Cooperativa SAESTI',
    registrations: 0,
    max_capacity: 100,
    status: 'upcoming',
  },
]

export function UpcomingEvents({ events = defaultEvents }: UpcomingEventsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Próximos Eventos</CardTitle>
        <Link href="/events" className="text-sm text-blue-600 hover:underline">
          Ver todos
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{event.name}</h3>
                <Badge
                  variant={event.status === 'ongoing' ? 'default' : 'secondary'}
                  className={
                    event.status === 'ongoing'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }
                >
                  {event.status === 'ongoing' ? 'En curso' : 'Próximo'}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(event.date)}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {event.registrations}/{event.max_capacity} registrados
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
