"use client"

import { useState, useEffect } from "react"
import { ClientCard } from "@/components/client-card"
import { ClientRequirementsModal } from "@/components/client-requirements-modal"
import { AddClientModal } from "@/components/add-client-modal"
import { Header } from "@/components/header"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ClientRequirement {
  id: string
  document_type: string
  is_required: boolean
  compliance_status: "compliant" | "missing" | "expiring" | "expired"
  expiration_date?: string | null
}

interface Client {
  id: string
  name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  status: string
  requirements: ClientRequirement[]
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [complianceFilter, setComplianceFilter] = useState("all")
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedClientName, setSelectedClientName] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    filterClients()
  }, [clients, searchTerm, statusFilter, complianceFilter])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/clients")
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterClients = () => {
    let filtered = clients

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.contact_person && client.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((client) => client.status === statusFilter)
    }

    // Filter by compliance
    if (complianceFilter !== "all") {
      filtered = filtered.filter((client) => {
        const requiredDocs = client.requirements.filter((req) => req.is_required)
        const compliantDocs = requiredDocs.filter((req) => req.compliance_status === "compliant")
        const compliancePercentage = requiredDocs.length > 0 ? (compliantDocs.length / requiredDocs.length) * 100 : 100

        switch (complianceFilter) {
          case "compliant":
            return compliancePercentage === 100
          case "partial":
            return compliancePercentage > 0 && compliancePercentage < 100
          case "non-compliant":
            return compliancePercentage === 0
          default:
            return true
        }
      })
    }

    setFilteredClients(filtered)
  }

  const handleViewRequirements = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    if (client) {
      setSelectedClientId(clientId)
      setSelectedClientName(client.name)
      setIsModalOpen(true)
    }
  }

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "active", label: "Activo" },
    { value: "inactive", label: "Inactivo" },
    { value: "pending", label: "Pendiente" },
  ]

  const complianceOptions = [
    { value: "all", label: "Todos los cumplimientos" },
    { value: "compliant", label: "100% Cumplido" },
    { value: "partial", label: "Cumplimiento Parcial" },
    { value: "non-compliant", label: "Sin Cumplir" },
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

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Clientes</h1>
              <p className="text-muted-foreground">Administre los clientes y sus requisitos documentales</p>
            </div>
            <AddClientModal onClientAdded={fetchClients} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, contacto o email..."
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

            <Select value={complianceFilter} onValueChange={setComplianceFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {complianceOptions.map((compliance) => (
                  <SelectItem key={compliance.value} value={compliance.value}>
                    {compliance.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando clientes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {clients.length === 0
                ? "No hay clientes registrados"
                : "No se encontraron clientes con los filtros aplicados"}
            </p>
            {clients.length === 0 && <AddClientModal onClientAdded={fetchClients} />}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} onViewRequirements={handleViewRequirements} />
            ))}
          </div>
        )}

        <ClientRequirementsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          clientId={selectedClientId}
          clientName={selectedClientName}
        />
      </div>
    </div>
  )
}
