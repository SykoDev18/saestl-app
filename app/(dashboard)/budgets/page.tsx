import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, PiggyBank } from 'lucide-react'

export default function BudgetsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Presupuestos</h1>
          <p className="text-gray-500">
            Planifica y controla los gastos por categoría
          </p>
        </div>
        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Presupuesto
        </Button>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Presupuestos Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
              <PiggyBank className="w-8 h-8 text-cyan-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay presupuestos definidos
            </h3>
            <p className="text-gray-500 mb-4 max-w-sm">
              Define presupuestos para controlar los gastos y evitar exceder los límites.
            </p>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Crear Presupuesto
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
