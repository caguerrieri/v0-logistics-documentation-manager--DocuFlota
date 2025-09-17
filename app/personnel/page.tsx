"use client"

import { useState, useEffect } from "react"
import { PersonnelCard } from "@/components/personnel-card"
import { PersonnelDocumentsModal } from "@/components/personnel-documents-modal"
import { AddPersonnelModal } from "@/components/add-personnel-modal"
import { Header } from "@/components/header"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowLeft, Users, Clock, AlertTriangle, Plus } from "lucide-react"
import Link from "next/link"

interface Document {
  id: string
  document_type: string
  file_name: string
  expiration_date: string | null
  status: "valid" | "expiring" | "expired"
  days_until_expiration?: number
  created_at: string
}

interface Personnel {
  id: string
  first_name: string
  last_name: string
  document_number: string
  phone: string | null
  email: string | null
  position: string
  status: string
  documents: Document[]
  next_expiration?: string
  global_status?: "vigente" | "por_vencer" | "vencido"
}

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([
    {
      id: "1",
      first_name: "Juan Carlos",
      last_name: "Pérez",
      document_number: "12345678",
      phone: "+54 11 1234-5678",
      email: "juan.perez@empresa.com",
      position: "Chofer",
      status: "active",
      next_expiration: "2024-06-15",
      global_status: "vigente",
      documents: [],
    },
    {
      id: "2",
      first_name: "María Elena",
      last_name: "González",
      document_number: "87654321",
      phone: "+54 11 8765-4321",
      email: "maria.gonzalez@empresa.com",
      position: "Chofer",
      status: "active",
      next_expiration: "2024-05-05",
      global_status: "por_vencer",
      documents: [],
    },
    {
      id: "3",
      first_name: "Roberto",
      last_name: "Martínez",
      document_number: "11223344",
      phone: "+54 11 1122-3344",
      email: "roberto.martinez@empresa.com",
      position: "Administrativo",
      status: "active",
      next_expiration: "2024-04-20",
      global_status: "vencido",
      documents: [],
    },
  ])
  const [filteredPersonnel, setFilteredPersonnel] = useState<Personnel[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string | null>(null)
  const [selectedPersonnelName, setSelectedPersonnelName] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchPersonnel()
  }, [])

  useEffect(() => {
    filterPersonnel()
  }, [personnel, searchTerm, statusFilter, positionFilter])

  const fetchPersonnel = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/personnel")
      if (response.ok) {
        const data = await response.json()
        setPersonnel(data)
      }
    } catch (error) {
      console.error("Error fetching personnel:", error)
      // Usar datos de ejemplo si falla la API
      setPersonnel([
        {
          id: "1",
          first_name: "Juan Carlos",
          last_name: "Pérez",
          document_number: "12345678",
          phone: "+54 11 1234-5678",
          email: "juan.perez@empresa.com",
          position: "Chofer",
          status: "active",
          next_expiration: "2024-06-15",
          global_status: "vigente",
          documents: [],
        },
        {
          id: "2",
          first_name: "María Elena",
          last_name: "González",
          document_number: "87654321",
          phone: "+54 11 8765-4321",
          email: "maria.gonzalez@empresa.com",
          position: "Chofer",
          status: "active",
          next_expiration: "2024-05-05",
          global_status: "por_vencer",
          documents: [],
        },
        {
          id: "3",
          first_name: "Roberto",
          last_name: "Martínez",
          document_number: "11223344",
          phone: "+54 11 1122-3344",
          email: "roberto.martinez@empresa.com",
          position: "Administrativo",
          status: "active",
          next_expiration: "2024-04-20",
          global_status: "vencido",
          documents: [],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filterPersonnel = () => {
    let filtered = personnel

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (person) =>
          person.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.document_number.includes(searchTerm) ||
          (person.email && person.email.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((person) => person.status === statusFilter)
    }

    // Filter by position
    if (positionFilter !== "all") {
      filtered = filtered.filter((person) => person.position === positionFilter)
    }

    setFilteredPersonnel(filtered)
  }

  const handleViewDocuments = (personnelId: string) => {
    const person = personnel.find((p) => p.id === personnelId)
    if (person) {
      setSelectedPersonnelId(personnelId)
      setSelectedPersonnelName(`${person.first_name} ${person.last_name}`)
      setIsModalOpen(true)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "vigente":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Vigente</Badge>
      case "por_vencer":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Por vencer</Badge>
      case "vencido":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Vencido</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vigente":
        return "text-green-600"
      case "por_vencer":
        return "text-yellow-600"
      case "vencido":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  // Calcular estadísticas
  const stats = {
    totalPersonnel: personnel.length,
    expiringPersonnel: personnel.filter(p => p.global_status === "por_vencer").length,
    expiredPersonnel: personnel.filter(p => p.global_status === "vencido").length,
  }

  const positions = [
    { value: "all", label: "Todos los cargos" },
    { value: "Chofer", label: "Chofer" },
    { value: "Operario", label: "Operario" },
    { value: "Supervisor", label: "Supervisor" },
    { value: "Mecánico", label: "Mecánico" },
    { value: "Administrativo", label: "Administrativo" },
    { value: "Otro", label: "Otro" },
  ]

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "active", label: "Activo" },
    { value: "inactive", label: "Inactivo" },
    { value: "suspended", label: "Suspendido" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Personal</h1>
              <p className="text-muted-foreground">Choferes y documentación habilitante</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Personal
            </Button>
          </div>

          {/* Estadísticas */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Personal</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPersonnel}</div>
                <p className="text-xs text-muted-foreground">Personal registrado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.expiringPersonnel}</div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Próximos a vencer
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.expiredPersonnel}</div>
                <Badge variant="destructive">Vencidos</Badge>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, DNI o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {positions.map((position) => (
                  <SelectItem key={position.value} value={position.value}>
                    {position.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando personal...</p>
          </div>
        ) : filteredPersonnel.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {personnel.length === 0
                ? "No hay personal registrado"
                : "No se encontró personal con los filtros aplicados"}
            </p>
            {personnel.length === 0 && <AddPersonnelModal onPersonnelAdded={fetchPersonnel} />}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPersonnel.map((person) => (
              <Card key={person.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {person.first_name} {person.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{person.position}</p>
                    </div>
                    {getStatusBadge(person.global_status || "vigente")}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Próximo vencimiento:</span>
                      <span className={`font-medium ${getStatusColor(person.global_status || "vigente")}`}>
                        {person.next_expiration}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewDocuments(person.id)}
                      >
                        Ver documentos
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Historial
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <PersonnelDocumentsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          personnelId={selectedPersonnelId}
          personnelName={selectedPersonnelName}
        />
      </div>
    </div>
  )
}
