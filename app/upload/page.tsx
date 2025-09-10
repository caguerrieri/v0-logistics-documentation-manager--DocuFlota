import { DocumentUploadForm } from "@/components/document-upload-form"

export default function UploadPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Documentos</h1>
        <p className="text-gray-600">Sistema de carga y seguimiento de documentación para empresas de logística</p>
      </div>

      <DocumentUploadForm />
    </div>
  )
}
