"use client"

import { useState, useEffect } from "react"
import { PersonnelCard } from "@/components/personnel-card"
import { PersonnelDocumentsModal } from "@/components/personnel-documents-modal"
import { AddPersonnelModal } from "@/components/add-personnel-modal"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, ArrowLeft } from "lucide-react"
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
}

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [filteredPersonnel, setFilteredPersonnel] = useState<Personnel[]>([])
  const [loading, setLoading] = useState(true)
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

  const positions = [
    { value: "all", label: "Todos los cargos" },
    { value: "driver", label: "Conductor" },
    { value: "operator", label: "Operario" },
    { value: "supervisor", label: "Supervisor" },
    { value: "mechanic", label: "Mecánico" },
    { value: "administrator", label: "Administrativo" },
    { value: "other", label: "Otro" },
  ]

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "active", label: "Activo" },
    { value: "inactive", label: "Inactivo" },
    { value: "suspended", label: "Suspendido" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Personal</h1>
              <p className="text-gray-600">Administre el personal y su documentación</p>
            </div>
            <AddPersonnelModal onPersonnelAdded={fetchPersonnel} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
            <p className="text-gray-500">Cargando personal...</p>
          </div>
        ) : filteredPersonnel.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {personnel.length === 0
                ? "No hay personal registrado"
                : "No se encontró personal con los filtros aplicados"}
            </p>
            {personnel.length === 0 && <AddPersonnelModal onPersonnelAdded={fetchPersonnel} />}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPersonnel.map((person) => (
              <PersonnelCard key={person.id} personnel={person} onViewDocuments={handleViewDocuments} />
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
