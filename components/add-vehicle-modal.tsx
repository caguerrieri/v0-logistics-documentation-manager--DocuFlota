"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AddVehicleModalProps {
  onVehicleAdded: () => void
}

export function AddVehicleModal({ onVehicleAdded }: AddVehicleModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    license_plate: "",
    brand: "",
    model: "",
    year: "",
    vehicle_type: "",
    status: "active",
    notes: "",
  })

  const vehicleTypes = [
    { value: "truck", label: "Camión" },
    { value: "van", label: "Furgoneta" },
    { value: "car", label: "Automóvil" },
    { value: "motorcycle", label: "Motocicleta" },
    { value: "trailer", label: "Remolque" },
    { value: "other", label: "Otro" },
  ]

  const statusOptions = [
    { value: "active", label: "Activo" },
    { value: "maintenance", label: "En Mantenimiento" },
    { value: "inactive", label: "Inactivo" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.license_plate || !formData.brand || !formData.model || !formData.year || !formData.vehicle_type) {
      setError("Por favor complete todos los campos obligatorios")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          year: Number.parseInt(formData.year),
        }),
      })

      if (!response.ok) {
        throw new Error("Error al crear el vehículo")
      }

      // Reset form and close modal
      setFormData({
        license_plate: "",
        brand: "",
        model: "",
        year: "",
        vehicle_type: "",
        status: "active",
        notes: "",
      })
      setIsOpen(false)
      onVehicleAdded()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Vehículo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Vehículo</DialogTitle>
          <DialogDescription>Complete la información del vehículo para agregarlo al sistema</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="license_plate">Patente *</Label>
            <Input
              id="license_plate"
              value={formData.license_plate}
              onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
              placeholder="ABC123"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Ford"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Transit"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Año *</Label>
              <Input
                id="year"
                type="number"
                min="1900"
                max="2030"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2020"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_type">Tipo *</Label>
              <Select
                value={formData.vehicle_type}
                onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
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

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              disabled={loading}
            >
              <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Información adicional sobre el vehículo"
              disabled={loading}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Vehículo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
