import { DocumentUploadForm } from "@/components/document-upload-form"
import { Header } from "@/components/header"

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Header />

      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Subir Documentos</h1>
          <p className="text-blue-700 text-lg max-w-3xl mx-auto leading-relaxed">
            Suba documentos de vehículos o personal. El sistema identificará automáticamente el tipo de documento y
            extraerá información clave como fechas de vencimiento para mantener su flota en cumplimiento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 text-center border border-blue-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-blue-900 mb-2">Identificación Automática</h3>
            <p className="text-blue-700 text-sm">
              Detecta automáticamente el tipo de documento (Seguro, VTV, Licencias)
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 text-center border border-blue-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0l-2 9a2 2 0 002 2h8a2 2 0 002-2l-2-9m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v0"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-blue-900 mb-2">Extracción de Datos</h3>
            <p className="text-blue-700 text-sm">
              Extrae fechas de vencimiento, números de documento y otros campos clave
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 text-center border border-blue-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-blue-900 mb-2">Alertas de Vencimiento</h3>
            <p className="text-blue-700 text-sm">Sistema de alertas automáticas a 30, 15 y 7 días del vencimiento</p>
          </div>
        </div>

        <DocumentUploadForm />
      </div>
    </div>
  )
}
