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
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AddClientModalProps {
  onClientAdded: () => void
}

const documentTypes = [
  { value: "insurance", label: "Seguro" },
  { value: "vtv", label: "VTV" },
  { value: "drivers_license", label: "Licencia de Conducir" },
  { value: "vehicle_registration", label: "Cédula Verde" },
  { value: "medical_certificate", label: "Certificado Médico" },
  { value: "work_permit", label: "Permiso de Trabajo" },
  { value: "other", label: "Otro" },
]

export function AddClientModal({ onClientAdded }: AddClientModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    status: "active",
    notes: "",
  })

  const [requirements, setRequirements] = useState<Record<string, boolean>>({})

  const statusOptions = [
    { value: "active", label: "Activo" },
    { value: "inactive", label: "Inactivo" },
    { value: "pending", label: "Pendiente" },
  ]

  const handleRequirementChange = (docType: string, required: boolean) => {
    setRequirements((prev) => ({
      ...prev,
      [docType]: required,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      setError("Por favor ingrese el nombre del cliente")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          requirements,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al crear el cliente")
      }

      // Reset form and close modal
      setFormData({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        status: "active",
        notes: "",
      })
      setRequirements({})
      setIsOpen(false)
      onClientAdded()
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
          Agregar Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
          <DialogDescription>
            Complete la información del cliente y defina sus requisitos documentales
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información del Cliente</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Cliente *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Empresa ABC S.A."
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_person">Persona de Contacto</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="Juan Pérez"
                  disabled={loading}
                />
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contacto@empresa.com"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+54 11 1234-5678"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Información adicional sobre el cliente"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Requisitos Documentales</h3>
            <p className="text-sm text-muted-foreground">Seleccione qué documentos son requeridos por este cliente</p>

            <div className="grid grid-cols-1 gap-3">
              {documentTypes.map((docType) => (
                <div key={docType.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={docType.value}
                    checked={requirements[docType.value] || false}
                    onCheckedChange={(checked) => handleRequirementChange(docType.value, checked as boolean)}
                    disabled={loading}
                  />
                  <Label htmlFor={docType.value} className="text-sm font-normal">
                    {docType.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
