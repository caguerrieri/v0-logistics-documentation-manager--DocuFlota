"use client"

import { useState, useEffect } from "react"
import { VehicleCard } from "@/components/vehicle-card"
import { VehicleDocumentsModal } from "@/components/vehicle-documents-modal"
import { AddVehicleModal } from "@/components/add-vehicle-modal"
import { Header } from "@/components/header"
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

interface Vehicle {
  id: string
  license_plate: string
  brand: string
  model: string
  year: number
  vehicle_type: string
  status: string
  documents: Document[]
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, searchTerm, statusFilter, typeFilter])

  const fetchVehicles = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/vehicles")
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterVehicles = () => {
    let filtered = vehicles

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.status === statusFilter)
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.vehicle_type === typeFilter)
    }

    setFilteredVehicles(filtered)
  }

  const handleViewDocuments = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    if (vehicle) {
      setSelectedVehicleId(vehicleId)
      setSelectedVehiclePlate(vehicle.license_plate)
      setIsModalOpen(true)
    }
  }

  const vehicleTypes = [
    { value: "all", label: "Todos los tipos" },
    { value: "truck", label: "Camión" },
    { value: "van", label: "Furgoneta" },
    { value: "car", label: "Automóvil" },
    { value: "motorcycle", label: "Motocicleta" },
    { value: "trailer", label: "Remolque" },
    { value: "other", label: "Otro" },
  ]

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "active", label: "Activo" },
    { value: "maintenance", label: "En Mantenimiento" },
    { value: "inactive", label: "Inactivo" },
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
              <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Vehículos</h1>
              <p className="text-muted-foreground">Administre la flota de vehículos y su documentación</p>
            </div>
            <AddVehicleModal onVehicleAdded={fetchVehicles} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por patente, marca o modelo..."
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

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando vehículos...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {vehicles.length === 0
                ? "No hay vehículos registrados"
                : "No se encontraron vehículos con los filtros aplicados"}
            </p>
            {vehicles.length === 0 && <AddVehicleModal onVehicleAdded={fetchVehicles} />}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} onViewDocuments={handleViewDocuments} />
            ))}
          </div>
        )}

        <VehicleDocumentsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          vehicleId={selectedVehicleId}
          vehiclePlate={selectedVehiclePlate}
        />
      </div>
    </div>
  )
}
