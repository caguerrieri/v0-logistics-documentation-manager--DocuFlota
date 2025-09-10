"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TrafficLightIndicator } from "./traffic-light-indicator"
import { FileText, Download, Calendar, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Document {
  id: string
  document_type: string
  file_name: string
  file_url: string
  expiration_date: string | null
  issuer: string | null
  document_number: string | null
  notes: string | null
  status: "valid" | "expiring" | "expired"
  days_until_expiration?: number
  created_at: string
}

interface PersonnelDocumentsModalProps {
  isOpen: boolean
  onClose: () => void
  personnelId: string | null
  personnelName: string
}

const documentTypeLabels: Record<string, string> = {
  drivers_license: "Licencia de Conducir",
  registration: "Registro de Conducir",
  medical_certificate: "Certificado Médico",
  work_permit: "Permiso de Trabajo",
  other: "Otro",
}

export function PersonnelDocumentsModal({ isOpen, onClose, personnelId, personnelName }: PersonnelDocumentsModalProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && personnelId) {
      fetchDocuments()
    }
  }, [isOpen, personnelId])

  const fetchDocuments = async () => {
    if (!personnelId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/documents?category=personnel&entity_id=${personnelId}`)
      if (response.ok) {
        const docs = await response.json()

        // Calculate status for each document
        const now = new Date()
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

        const docsWithStatus = docs.map((doc: any) => {
          let status: "valid" | "expiring" | "expired" = "valid"
          let daysUntilExpiration: number | undefined

          if (doc.expiration_date) {
            const expirationDate = new Date(doc.expiration_date)
            daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

            if (expirationDate < now) {
              status = "expired"
            } else if (expirationDate <= thirtyDaysFromNow) {
              status = "expiring"
            }
          }

          return {
            ...doc,
            status,
            days_until_expiration: daysUntilExpiration,
          }
        })

        setDocuments(docsWithStatus)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos de {personnelName}
          </DialogTitle>
          <DialogDescription>Lista completa de documentos asociados a este empleado</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando documentos...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay documentos registrados para este empleado</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{documentTypeLabels[doc.document_type] || doc.document_type}</h3>
                    <p className="text-sm text-muted-foreground">{doc.file_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrafficLightIndicator status={doc.status} daysUntilExpiration={doc.days_until_expiration} />
                    <Button variant="outline" size="sm" onClick={() => handleDownload(doc.file_url, doc.file_name)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {doc.expiration_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Vence: {new Date(doc.expiration_date).toLocaleDateString("es-ES")}</span>
                    </div>
                  )}

                  {doc.issuer && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Emisor: {doc.issuer}</span>
                    </div>
                  )}

                  {doc.document_number && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Número: {doc.document_number}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Subido {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: es })}</span>
                  </div>
                </div>

                {doc.notes && (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    <strong>Notas:</strong> {doc.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
