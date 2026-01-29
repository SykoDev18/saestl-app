import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500">
            Genera informes financieros y estadísticas
          </p>
        </div>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
          <Download className="w-4 h-4 mr-2" />
          Generar Informe Mensual
        </Button>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Informes Generados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay informes generados
            </h3>
            <p className="text-gray-500 mb-4 max-w-sm">
              Genera tu primer informe mensual para ver un resumen de las finanzas.
            </p>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Download className="w-4 h-4 mr-2" />
              Generar Informe
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
