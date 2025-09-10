"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrafficLightIndicator } from "./traffic-light-indicator"
import { FileText, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Document {
  id: string
  document_type: string
  category: string
  entity_id: string
  file_name: string
  expiration_date: string | null
  created_at: string
  status: "valid" | "expiring" | "expired"
  days_until_expiration?: number
}

interface RecentDocumentsProps {
  documents: Document[]
}

const documentTypeLabels: Record<string, string> = {
  insurance: "Seguro",
  vtv: "VTV",
  drivers_license: "Licencia de Conducir",
  registration: "Registro de Conducir",
  vehicle_registration: "Cédula Verde",
  medical_certificate: "Certificado Médico",
  work_permit: "Permiso de Trabajo",
  other: "Otro",
}

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentos Recientes
        </CardTitle>
        <CardDescription>Últimos documentos subidos al sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No hay documentos recientes</p>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">
                      {documentTypeLabels[doc.document_type] || doc.document_type}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {doc.category === "vehicle" ? "Vehículo" : "Personal"}: {doc.entity_id}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{doc.file_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Subido {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <TrafficLightIndicator status={doc.status} daysUntilExpiration={doc.days_until_expiration} />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
