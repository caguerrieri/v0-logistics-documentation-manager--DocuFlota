"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Building2, FileText, Eye, AlertTriangle, CheckCircle } from "lucide-react"

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

interface ClientCardProps {
  client: Client
  onViewRequirements: (clientId: string) => void
}

const documentTypeLabels: Record<string, string> = {
  insurance: "Seguro",
  vtv: "VTV",
  drivers_license: "Licencia de Conducir",
  vehicle_registration: "Cédula Verde",
  medical_certificate: "Certificado Médico",
  work_permit: "Permiso de Trabajo",
  other: "Otro",
}

export function ClientCard({ client, onViewRequirements }: ClientCardProps) {
  const getClientStatusBadge = (status: string) => {
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
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pendiente
          </Badge>
        )
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const requiredDocs = client.requirements.filter((req) => req.is_required)
  const compliantDocs = requiredDocs.filter((req) => req.compliance_status === "compliant")
  const criticalDocs = requiredDocs.filter(
    (req) =>
      req.compliance_status === "missing" ||
      req.compliance_status === "expired" ||
      req.compliance_status === "expiring",
  )

  const compliancePercentage = requiredDocs.length > 0 ? (compliantDocs.length / requiredDocs.length) * 100 : 100

  const getComplianceColor = () => {
    if (compliancePercentage === 100) return "text-green-600"
    if (compliancePercentage >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getComplianceIcon = () => {
    if (compliancePercentage === 100) return <CheckCircle className="h-4 w-4 text-green-600" />
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {client.name}
          </CardTitle>
          {getClientStatusBadge(client.status)}
        </div>
        {client.contact_person && (
          <div className="text-sm text-muted-foreground">Contacto: {client.contact_person}</div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(client.email || client.phone) && (
            <div className="space-y-1 text-sm text-muted-foreground">
              {client.email && <div>Email: {client.email}</div>}
              {client.phone && <div>Teléfono: {client.phone}</div>}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getComplianceIcon()}
                <span className={`text-sm font-medium ${getComplianceColor()}`}>
                  Cumplimiento: {Math.round(compliancePercentage)}%
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {compliantDocs.length}/{requiredDocs.length} documentos
              </span>
            </div>
            <Progress value={compliancePercentage} className="h-2" />
          </div>

          {criticalDocs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-600">Documentos pendientes:</h4>
              {criticalDocs.slice(0, 3).map((req) => (
                <div key={req.id} className="flex items-center justify-between p-2 bg-red-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium">{documentTypeLabels[req.document_type] || req.document_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {req.compliance_status === "missing" && "Faltante"}
                      {req.compliance_status === "expired" && "Vencido"}
                      {req.compliance_status === "expiring" && "Por vencer"}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {req.compliance_status === "missing"
                      ? "Falta"
                      : req.compliance_status === "expired"
                        ? "Vencido"
                        : "Por vencer"}
                  </Badge>
                </div>
              ))}
              {criticalDocs.length > 3 && (
                <p className="text-xs text-muted-foreground">+{criticalDocs.length - 3} documentos más pendientes</p>
              )}
            </div>
          )}

          {requiredDocs.length > 0 && criticalDocs.length === 0 && (
            <div className="p-2 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">Todos los requisitos están cumplidos</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{requiredDocs.length} requisitos</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => onViewRequirements(client.id)}>
              <Eye className="h-4 w-4 mr-2" />
              Ver Requisitos
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
