"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, AlertCircle, CheckCircle, Truck, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DocumentUploadFormProps {
  onUploadComplete?: (document: any) => void
}

export function DocumentUploadForm({ onUploadComplete }: DocumentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [documentType, setDocumentType] = useState("")
  const [category, setCategory] = useState("")
  const [entityId, setEntityId] = useState("")
  const [expirationDate, setExpirationDate] = useState("")
  const [issuer, setIssuer] = useState("")
  const [documentNumber, setDocumentNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const documentTypes = [
    { value: "insurance", label: "Seguro" },
    { value: "vtv", label: "VTV (Verificación Técnica Vehicular)" },
    { value: "drivers_license", label: "Licencia de Conducir" },
    { value: "registration", label: "Registro de Conducir" },
    { value: "vehicle_registration", label: "Cédula Verde" },
    { value: "medical_certificate", label: "Certificado Médico" },
    { value: "work_permit", label: "Permiso de Trabajo" },
    { value: "other", label: "Otro" },
  ]

  const categories = [
    { value: "vehicle", label: "Vehículo" },
    { value: "personnel", label: "Personal" },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Solo se permiten archivos JPG, PNG, WEBP o PDF")
        return
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("El archivo no puede superar los 10MB")
        return
      }

      setFile(selectedFile)
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !documentType || !category || !entityId) {
      setError("Por favor complete todos los campos obligatorios")
      return
    }

    setUploading(true)
    setError("")

    try {
      // Upload file to Blob storage
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Error al subir el archivo")
      }

      const uploadResult = await uploadResponse.json()

      // Save document metadata to database
      const documentData = {
        document_type: documentType,
        category,
        entity_id: entityId,
        file_url: uploadResult.url,
        file_name: uploadResult.filename,
        file_size: uploadResult.size,
        file_type: uploadResult.type,
        expiration_date: expirationDate || null,
        issuer: issuer || null,
        document_number: documentNumber || null,
        notes: notes || null,
      }

      const saveResponse = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(documentData),
      })

      if (!saveResponse.ok) {
        throw new Error("Error al guardar el documento")
      }

      const savedDocument = await saveResponse.json()

      setSuccess(true)
      onUploadComplete?.(savedDocument)

      // Reset form
      setFile(null)
      setDocumentType("")
      setCategory("")
      setEntityId("")
      setExpirationDate("")
      setIssuer("")
      setDocumentNumber("")
      setNotes("")

      // Reset file input
      const fileInput = document.getElementById("file-input") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Upload className="h-6 w-6" />
          Subir Documento
        </CardTitle>
        <CardDescription className="text-blue-100">
          Complete la información del documento para una gestión eficiente de su flota
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Documento subido exitosamente</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="file-input" className="text-blue-900 font-medium">
              Archivo *
            </Label>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <Input
                id="file-input"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-blue-700 font-medium">Haga clic para seleccionar archivo</p>
                <p className="text-blue-600 text-sm">JPG, PNG, WEBP o PDF (máx. 10MB)</p>
              </label>
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
                <FileText className="h-4 w-4" />
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-blue-900 font-medium flex items-center gap-2">
                Categoría *
              </Label>
              <Select value={category} onValueChange={setCategory} disabled={uploading}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vehicle">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-600" />
                      Vehículo
                    </div>
                  </SelectItem>
                  <SelectItem value="personnel">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Personal
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-type" className="text-blue-900 font-medium">
                Tipo de Documento *
              </Label>
              <Select value={documentType} onValueChange={setDocumentType} disabled={uploading}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entity-id" className="text-blue-900 font-medium">
              {category === "vehicle" ? "ID del Vehículo" : "ID del Personal"} *
            </Label>
            <Input
              id="entity-id"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder={category === "vehicle" ? "Ej: VEH001" : "Ej: PER001"}
              disabled={uploading}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiration-date" className="text-blue-900 font-medium">
                Fecha de Vencimiento
              </Label>
              <Input
                id="expiration-date"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                disabled={uploading}
                className="border-blue-200 focus:border-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-number" className="text-blue-900 font-medium">
                Número de Documento
              </Label>
              <Input
                id="document-number"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Ej: 123456789"
                disabled={uploading}
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuer" className="text-blue-900 font-medium">
              Emisor
            </Label>
            <Input
              id="issuer"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="Ej: Municipalidad, Compañía de Seguros"
              disabled={uploading}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-blue-900 font-medium">
              Notas Adicionales
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Información adicional sobre el documento"
              disabled={uploading}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>

          <Button
            type="submit"
            disabled={uploading || !file}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3"
          >
            {uploading ? "Subiendo..." : "Subir Documento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
