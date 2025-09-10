"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, CheckCircle, AlertTriangle, Clock, X } from "lucide-react"

interface ClientRequirement {
  id: string
  document_type: string
  is_required: boolean
  compliance_status: "compliant" | "missing" | "expiring" | "expired"
  expiration_date?: string | null
  document_id?: string | null
}

interface ClientRequirementsModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string | null
  clientName: string
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

export function ClientRequirementsModal({ isOpen, onClose, clientId, clientName }: ClientRequirementsModalProps) {
  const [requirements, setRequirements] = useState<ClientRequirement[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && clientId) {
      fetchRequirements()
    }
  }, [isOpen, clientId])

  const fetchRequirements = async () => {
    if (!clientId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/clients/${clientId}/requirements`)
      if (response.ok) {
        const data = await response.json()
        setRequirements(data)
      }
    } catch (error) {
      console.error("Error fetching requirements:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "expiring":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "missing":
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Cumplido
          </Badge>
        )
      case "expiring":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Por vencer
          </Badge>
        )
      case "expired":
        return <Badge variant="destructive">Vencido</Badge>
      case "missing":
        return <Badge variant="destructive">Faltante</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const requiredRequirements = requirements.filter((req) => req.is_required)
  const compliantRequirements = requiredRequirements.filter((req) => req.compliance_status === "compliant")
  const compliancePercentage =
    requiredRequirements.length > 0 ? (compliantRequirements.length / requiredRequirements.length) * 100 : 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Requisitos de {clientName}
          </DialogTitle>
          <DialogDescription>Lista completa de documentos requeridos por este cliente</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando requisitos...</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Resumen de Cumplimiento</h3>
                  <span className="text-sm text-muted-foreground">
                    {compliantRequirements.length}/{requiredRequirements.length} documentos cumplidos
                  </span>
                </div>
                <Progress value={compliancePercentage} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  {Math.round(compliancePercentage)}% de cumplimiento general
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Documentos Requeridos</h3>
                {requiredRequirements.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No hay requisitos definidos para este cliente</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requiredRequirements.map((req) => (
                      <div key={req.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(req.compliance_status)}
                            <div>
                              <h4 className="font-medium">
                                {documentTypeLabels[req.document_type] || req.document_type}
                              </h4>
                              {req.expiration_date && (
                                <p className="text-sm text-muted-foreground">
                                  Vence: {new Date(req.expiration_date).toLocaleDateString("es-ES")}
                                </p>
                              )}
                            </div>
                          </div>
                          {getStatusBadge(req.compliance_status)}
                        </div>

                        {req.compliance_status === "missing" && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                            Este documento es requerido pero no está disponible en el sistema
                          </div>
                        )}

                        {req.compliance_status === "expired" && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                            Este documento ha vencido y necesita ser renovado
                          </div>
                        )}

                        {req.compliance_status === "expiring" && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                            Este documento vence pronto y necesita ser renovado
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {requirements.filter((req) => !req.is_required).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Documentos Opcionales</h3>
                  <div className="space-y-3">
                    {requirements
                      .filter((req) => !req.is_required)
                      .map((req) => (
                        <div key={req.id} className="border rounded-lg p-4 opacity-75">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(req.compliance_status)}
                              <div>
                                <h4 className="font-medium">
                                  {documentTypeLabels[req.document_type] || req.document_type}
                                </h4>
                                <p className="text-sm text-muted-foreground">Documento opcional</p>
                              </div>
                            </div>
                            {getStatusBadge(req.compliance_status)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
