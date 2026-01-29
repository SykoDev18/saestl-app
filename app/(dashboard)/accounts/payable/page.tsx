import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Wallet } from 'lucide-react'

export default function AccountsPayablePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cuentas por Pagar</h1>
          <p className="text-gray-500">
            Gestiona las deudas y pagos pendientes
          </p>
        </div>
        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cuenta
        </Button>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Cuentas Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay cuentas por pagar
            </h3>
            <p className="text-gray-500 mb-4 max-w-sm">
              Registra las deudas pendientes para llevar un control de los pagos.
            </p>
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Deuda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
