"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronRight, Upload, History, Plus } from "lucide-react"

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Vehículos</h1>
            <p className="text-muted-foreground">Listado de unidades y su documentación habilitante</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Añadir vehículo
          </Button>
        </div>

        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="flex items-center gap-2">
                  Estado global
                  <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-xs text-gray-500">
                    ?
                  </div>
                </TableHead>
                <TableHead>Próximo vencimiento</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="hover:bg-gray-50">
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{vehicle.license_plate}</div>
                      <div className="text-sm text-muted-foreground">{vehicle.description}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{vehicle.vehicle_type}</TableCell>
                  <TableCell>{getStatusBadge(vehicle.global_status || "vigente")}</TableCell>
                  <TableCell className="text-muted-foreground">{vehicle.next_expiration}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-1" />
                        Cargar
                      </Button>
                      <Button variant="outline" size="sm">
                        <History className="h-4 w-4 mr-1" />
                        Historial
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
