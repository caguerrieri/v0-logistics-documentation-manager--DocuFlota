"use client"

import { AlertCenter } from "@/components/alert-center"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function AlertsPage() {
  const [refreshing, setRefreshing] = useState(false)

  const generateAlerts = async () => {
    setRefreshing(true)
    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`Generated ${result.created} new alerts`)
        // Refresh the page to show new alerts
        window.location.reload()
      }
    } catch (error) {
      console.error("Error generating alerts:", error)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={generateAlerts} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Actualizando..." : "Actualizar Alertas"}
            </Button>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Alertas</h1>
            <p className="text-gray-600">Gestione las notificaciones de documentos próximos a vencer</p>
          </div>
        </div>

        <AlertCenter />
      </div>
    </div>
  )
}
