"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrafficLightIndicator } from "./traffic-light-indicator"
import { User, FileText, Eye, Phone, Mail } from "lucide-react"

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

interface PersonnelCardProps {
  personnel: Personnel
  onViewDocuments: (personnelId: string) => void
}

const documentTypeLabels: Record<string, string> = {
  drivers_license: "Licencia de Conducir",
  registration: "Registro de Conducir",
  medical_certificate: "Certificado Médico",
  work_permit: "Permiso de Trabajo",
  other: "Otro",
}

export function PersonnelCard({ personnel, onViewDocuments }: PersonnelCardProps) {
  const getPersonnelStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Activo
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Inactivo
          </Badge>
        )
      case "suspended":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Suspendido
          </Badge>
        )
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const criticalDocuments = personnel.documents.filter((doc) => doc.status === "expired" || doc.status === "expiring")

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {personnel.first_name} {personnel.last_name}
          </CardTitle>
          {getPersonnelStatusBadge(personnel.status)}
        </div>
        <div className="text-sm text-muted-foreground">
          {personnel.position} - DNI: {personnel.document_number}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(personnel.phone || personnel.email) && (
            <div className="space-y-1">
              {personnel.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {personnel.phone}
                </div>
              )}
              {personnel.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {personnel.email}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{personnel.documents.length} documentos</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => onViewDocuments(personnel.id)}>
              <Eye className="h-4 w-4 mr-2" />
              Ver Documentos
            </Button>
          </div>

          {criticalDocuments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-600">Documentos que requieren atención:</h4>
              {criticalDocuments.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-red-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium">{documentTypeLabels[doc.document_type] || doc.document_type}</p>
                    {doc.expiration_date && (
                      <p className="text-xs text-muted-foreground">
                        Vence: {new Date(doc.expiration_date).toLocaleDateString("es-ES")}
                      </p>
                    )}
                  </div>
                  <TrafficLightIndicator status={doc.status} daysUntilExpiration={doc.days_until_expiration} />
                </div>
              ))}
              {criticalDocuments.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{criticalDocuments.length - 3} documentos más requieren atención
                </p>
              )}
            </div>
          )}

          {personnel.documents.length > 0 && criticalDocuments.length === 0 && (
            <div className="p-2 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">Todos los documentos están al día</p>
            </div>
          )}

          {personnel.documents.length === 0 && (
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">No hay documentos registrados</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
