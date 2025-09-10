import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Users, Building2, Upload, Bell } from "lucide-react"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
        <CardDescription>Acceda rápidamente a las funciones principales</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <Link href="/upload">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Upload className="mr-2 h-4 w-4" />
              Subir Documento
            </Button>
          </Link>

          <Link href="/vehicles">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Truck className="mr-2 h-4 w-4" />
              Gestionar Vehículos
            </Button>
          </Link>

          <Link href="/personnel">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Users className="mr-2 h-4 w-4" />
              Gestionar Personal
            </Button>
          </Link>

          <Link href="/clients">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Building2 className="mr-2 h-4 w-4" />
              Gestionar Clientes
            </Button>
          </Link>

          <Link href="/alerts">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Bell className="mr-2 h-4 w-4" />
              Ver Alertas
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
