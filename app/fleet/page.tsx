"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Search, Plus, ChevronRight } from "lucide-react"

interface Document {
  id: string
  name: string
  expiration_date: string | null
  status: "valid" | "expiring" | "expired" | "missing"
  days_until_expiration?: number
}

interface Vehicle {
  id: string
  license_plate: string
  alias?: string
  type: string
  status: "valid" | "expiring" | "expired"
  next_expiration: string | null
  documents: Document[]
}

interface Personnel {
  id: string
  first_name: string
  last_name: string
  role: string
  status: "valid" | "expiring" | "expired"
  next_expiration: string | null
  documents: Document[]
}

const calculateDocumentStatus = (
  expirationDate: string | null,
): { status: "valid" | "expiring" | "expired" | "missing"; daysUntil?: number } => {
  if (!expirationDate) return { status: "missing" }

  const today = new Date()
  const expDate = new Date(expirationDate)
  const diffTime = expDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { status: "expired", daysUntil: Math.abs(diffDays) }
  if (diffDays < 30) return { status: "expiring", daysUntil: diffDays }
  return { status: "valid", daysUntil: diffDays }
}

const StatusChip = ({
  status,
  daysUntil,
}: { status: "valid" | "expiring" | "expired" | "missing"; daysUntil?: number }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "valid":
        return { color: "bg-green-500", text: "Vigente", textColor: "text-white" }
      case "expiring":
        return { color: "bg-yellow-500", text: "Por vencer", textColor: "text-white" }
      case "expired":
        return { color: "bg-red-500", text: "Vencido", textColor: "text-white" }
      case "missing":
        return { color: "bg-gray-400", text: "Faltante", textColor: "text-white" }
    }
  }

  const config = getStatusConfig()

  return <Badge className={`${config.color} ${config.textColor} text-xs px-2 py-1 rounded-full`}>{config.text}</Badge>
}

const DaysRemaining = ({
  status,
  daysUntil,
}: { status: "valid" | "expiring" | "expired" | "missing"; daysUntil?: number }) => {
  if (status === "missing" || daysUntil === undefined) return null

  if (status === "expired") {
    return <span className="text-xs text-red-600">Vencido hace {daysUntil} días</span>
  }

  if (status === "expiring") {
    return <span className="text-xs text-yellow-600">Vence en {daysUntil} días</span>
  }

  return <span className="text-xs text-green-600">Vence en {daysUntil} días</span>
}

export default function FleetPage() {
  const [activeTab, setActiveTab] = useState("vehicles")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [documentFilter, setDocumentFilter] = useState("all")
  const [sortBy, setSortBy] = useState("next_expiration")

  const [vehicles] = useState<Vehicle[]>([
    {
      id: "1",
      license_plate: "ABC123",
      alias: "Camión Principal",
      type: "Tractor",
      status: "expiring",
      next_expiration: "2024-12-25",
      documents: [
        { id: "1", name: "Seguro", expiration_date: "2024-12-25", ...calculateDocumentStatus("2024-12-25") },
        { id: "2", name: "VTV", expiration_date: "2025-03-15", ...calculateDocumentStatus("2025-03-15") },
        {
          id: "3",
          name: "Habilitación Municipal",
          expiration_date: "2024-11-20",
          ...calculateDocumentStatus("2024-11-20"),
        },
      ],
    },
    {
      id: "2",
      license_plate: "XYZ789",
      alias: "Semirremolque 1",
      type: "Semirremolque",
      status: "valid",
      next_expiration: "2025-02-10",
      documents: [
        { id: "4", name: "Seguro", expiration_date: "2025-02-10", ...calculateDocumentStatus("2025-02-10") },
        { id: "5", name: "VTV", expiration_date: "2025-01-30", ...calculateDocumentStatus("2025-01-30") },
      ],
    },
  ])

  const [personnel] = useState<Personnel[]>([
    {
      id: "1",
      first_name: "Juan",
      last_name: "Pérez",
      role: "Chofer",
      status: "expired",
      next_expiration: "2024-11-15",
      documents: [
        {
          id: "6",
          name: "Licencia de Conducir",
          expiration_date: "2024-11-15",
          ...calculateDocumentStatus("2024-11-15"),
        },
        { id: "7", name: "Libreta Sanitaria", expiration_date: "2025-06-20", ...calculateDocumentStatus("2025-06-20") },
        { id: "8", name: "ART", expiration_date: null, ...calculateDocumentStatus(null) },
      ],
    },
    {
      id: "2",
      first_name: "María",
      last_name: "González",
      role: "Chofer",
      status: "valid",
      next_expiration: "2025-04-10",
      documents: [
        {
          id: "9",
          name: "Licencia de Conducir",
          expiration_date: "2025-04-10",
          ...calculateDocumentStatus("2025-04-10"),
        },
        {
          id: "10",
          name: "Libreta Sanitaria",
          expiration_date: "2025-08-15",
          ...calculateDocumentStatus("2025-08-15"),
        },
      ],
    },
  ])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="vehicles">Vehículos</TabsTrigger>
              <TabsTrigger value="personnel">Personal</TabsTrigger>
            </TabsList>

            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === "vehicles" ? "Añadir vehículo" : "Añadir persona"}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={activeTab === "vehicles" ? "Buscar por placa o identificador..." : "Buscar por nombre..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="valid">Verde</SelectItem>
                <SelectItem value="expiring">Amarillo</SelectItem>
                <SelectItem value="expired">Rojo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="next_expiration">Próximos a vencer</SelectItem>
                <SelectItem value="name">Nombre/Placa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="vehicles" className="space-y-4">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-foreground">Vehículos</h1>
              <p className="text-muted-foreground">Listado de unidades y su documentación habilitante</p>
            </div>

            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="w-full">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <ChevronRight className="h-4 w-4" />
                          <div>
                            <CardTitle className="text-lg">
                              {vehicle.license_plate} {vehicle.alias && `- ${vehicle.alias}`}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <StatusChip status={vehicle.status} />
                          <div className="text-right">
                            <p className="text-sm font-medium">Próximo vencimiento</p>
                            <p className="text-xs text-muted-foreground">
                              {vehicle.next_expiration
                                ? new Date(vehicle.next_expiration).toLocaleDateString("es-ES")
                                : "N/A"}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Cargar documento
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Documentos del vehículo</h4>
                        <div className="space-y-2">
                          {vehicle.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-medium">{doc.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {doc.expiration_date
                                      ? new Date(doc.expiration_date).toLocaleDateString("es-ES")
                                      : "Sin fecha"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <StatusChip status={doc.status} daysUntil={doc.days_until_expiration} />
                                  <div className="mt-1">
                                    <DaysRemaining status={doc.status} daysUntil={doc.days_until_expiration} />
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  Ver historial
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="personnel" className="space-y-4">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-foreground">Personal</h1>
              <p className="text-muted-foreground">Choferes y documentación habilitante</p>
            </div>

            {personnel.map((person) => (
              <Card key={person.id} className="w-full">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <ChevronRight className="h-4 w-4" />
                          <div>
                            <CardTitle className="text-lg">
                              {person.first_name} {person.last_name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{person.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <StatusChip status={person.status} />
                          <div className="text-right">
                            <p className="text-sm font-medium">Próximo vencimiento</p>
                            <p className="text-xs text-muted-foreground">
                              {person.next_expiration
                                ? new Date(person.next_expiration).toLocaleDateString("es-ES")
                                : "N/A"}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Cargar documento
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Documentos de la persona</h4>
                        <div className="space-y-2">
                          {person.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-medium">{doc.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {doc.expiration_date
                                      ? new Date(doc.expiration_date).toLocaleDateString("es-ES")
                                      : "Sin fecha"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <StatusChip status={doc.status} daysUntil={doc.days_until_expiration} />
                                  <div className="mt-1">
                                    <DaysRemaining status={doc.status} daysUntil={doc.days_until_expiration} />
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  Ver historial
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
