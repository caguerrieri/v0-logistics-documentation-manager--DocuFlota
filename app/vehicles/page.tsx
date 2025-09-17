"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { VehicleDocumentsModal } from "@/components/vehicle-documents-modal"
import { Upload, History, Plus, ArrowLeft } from "lucide-react"
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
  description?: string
  next_expiration?: string
  global_status?: "vigente" | "por_vencer" | "vencido"
}

export default function VehiclesPage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: "1",
      license_plate: "ABC-123",
      brand: "Volvo",
      model: "FH",
      year: 2020,
      vehicle_type: "Tractor",
      status: "active",
      description: "Tractor Principal",
      next_expiration: "15/01/2024",
      global_status: "vencido",
      documents: [],
    },
    {
      id: "2",
      license_plate: "DEF-456",
      brand: "Scania",
      model: "R450",
      year: 2019,
      vehicle_type: "Semirremolque",
      status: "active",
      description: "Semirremolque A",
      next_expiration: "10/02/2024",
      global_status: "por_vencer",
      documents: [],
    },
    {
      id: "3",
      license_plate: "GHI-789",
      brand: "Mercedes",
      model: "Actros",
      year: 2021,
      vehicle_type: "Tractor",
      status: "active",
      description: "Tractor Secundario",
      next_expiration: "25/04/2024",
      global_status: "vigente",
      documents: [],
    },
  ])

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

  const handleViewDocuments = (vehicleId: string, vehiclePlate: string) => {
    setSelectedVehicleId(vehicleId)
    setSelectedVehiclePlate(vehiclePlate)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto py-8 px-4">
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
              <h1 className="text-3xl font-bold text-foreground mb-2">Vehículos</h1>
              <p className="text-muted-foreground">Listado de unidades y su documentación habilitante</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Añadir vehículo
            </Button>
          </div>
        </div>

        {/* Vista de tarjetas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{vehicle.license_plate}</h3>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.description} • {vehicle.vehicle_type}
                    </p>
                  </div>
                  {getStatusBadge(vehicle.global_status || "vigente")}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Próximo vencimiento:</span>
                    <span className={`font-medium ${getStatusColor(vehicle.global_status || "vigente")}`}>
                      {vehicle.next_expiration}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Upload className="h-4 w-4 mr-1" />
                      Cargar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewDocuments(vehicle.id, vehicle.license_plate)}
                    >
                      <History className="h-4 w-4 mr-1" />
                      Ver documentos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
