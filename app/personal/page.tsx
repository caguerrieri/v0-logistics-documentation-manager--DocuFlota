import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, AlertTriangle, Upload, History, Plus } from "lucide-react"

export default function PersonalPage() {
  // Mock data - en producción vendría de la base de datos
  const personalData = [
    {
      id: 1,
      nombre: "Juan Carlos Pérez",
      rol: "Chofer",
      estado: "vigente",
      proximoVencimiento: "2024-06-15",
    },
    {
      id: 2,
      nombre: "María Elena González",
      rol: "Chofer",
      estado: "por-vencer",
      proximoVencimiento: "2024-05-05",
    },
    {
      id: 3,
      nombre: "Roberto Martínez",
      rol: "Administrativo",
      estado: "vencido",
      proximoVencimiento: "2024-04-20",
    },
  ]

  const totalPersonal = personalData.length
  const porVencer = personalData.filter((p) => p.estado === "por-vencer").length
  const vencidos = personalData.filter((p) => p.estado === "vencido").length

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "vigente":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Vigente</Badge>
      case "por-vencer":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Por Vencer</Badge>
      case "vencido":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Vencido</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Personal</h1>
              <p className="text-muted-foreground">Choferes y documentación habilitante</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Personal</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPersonal}</div>
              <p className="text-xs text-muted-foreground">Personal registrado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Por Vencer</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{porVencer}</div>
              <p className="text-xs text-muted-foreground">Próximos a vencer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vencidos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{vencidos}</div>
              <p className="text-xs text-muted-foreground">Vencidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Personal List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Personal</CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Personal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {personalData.map((persona) => (
                <div
                  key={persona.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{persona.nombre}</h3>
                        <p className="text-sm text-muted-foreground">{persona.rol}</p>
                      </div>
                      <div className="flex items-center gap-2">{getEstadoBadge(persona.estado)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{persona.proximoVencimiento}</p>
                      <p className="text-xs text-muted-foreground">Próximo vencimiento</p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-1" />
                        Cargar
                      </Button>
                      <Button variant="outline" size="sm">
                        <History className="h-4 w-4 mr-1" />
                        Historial
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
