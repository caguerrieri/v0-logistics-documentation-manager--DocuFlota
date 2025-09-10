"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, AlertTriangle, Clock, CheckCircle, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Alert {
  id: string
  document_id: string
  document_type: string
  entity_type: "vehicle" | "personnel"
  entity_id: string
  entity_name: string
  alert_type: "expiring_30" | "expiring_15" | "expiring_7" | "expired"
  expiration_date: string
  is_read: boolean
  created_at: string
}

export function AlertCenter() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/alerts")
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_read: true }),
      })

      if (response.ok) {
        setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, is_read: true } : alert)))
      }
    } catch (error) {
      console.error("Error marking alert as read:", error)
    }
  }

  const dismissAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
      }
    } catch (error) {
      console.error("Error dismissing alert:", error)
    }
  }

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "expiring_7":
        return <Clock className="h-4 w-4 text-red-500" />
      case "expiring_15":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "expiring_30":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getAlertBadge = (alertType: string) => {
    switch (alertType) {
      case "expired":
        return <Badge variant="destructive">Vencido</Badge>
      case "expiring_7":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Vence en 7 días
          </Badge>
        )
      case "expiring_15":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Vence en 15 días
          </Badge>
        )
      case "expiring_30":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Vence en 30 días
          </Badge>
        )
      default:
        return <Badge variant="secondary">Alerta</Badge>
    }
  }

  const getAlertMessage = (alert: Alert) => {
    const documentTypeLabels: Record<string, string> = {
      insurance: "Seguro",
      vtv: "VTV",
      drivers_license: "Licencia de Conducir",
      vehicle_registration: "Cédula Verde",
      medical_certificate: "Certificado Médico",
      work_permit: "Permiso de Trabajo",
      other: "Otro",
    }

    const docType = documentTypeLabels[alert.document_type] || alert.document_type
    const entityType = alert.entity_type === "vehicle" ? "Vehículo" : "Personal"

    switch (alert.alert_type) {
      case "expired":
        return `${docType} del ${entityType} ${alert.entity_name} ha vencido`
      case "expiring_7":
        return `${docType} del ${entityType} ${alert.entity_name} vence en 7 días`
      case "expiring_15":
        return `${docType} del ${entityType} ${alert.entity_name} vence en 15 días`
      case "expiring_30":
        return `${docType} del ${entityType} ${alert.entity_name} vence en 30 días`
      default:
        return `Alerta para ${docType} del ${entityType} ${alert.entity_name}`
    }
  }

  const unreadAlerts = alerts.filter((alert) => !alert.is_read)
  const readAlerts = alerts.filter((alert) => alert.is_read)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Centro de Alertas
          {unreadAlerts.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadAlerts.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Notificaciones de documentos próximos a vencer o vencidos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Cargando alertas...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-muted-foreground">No hay alertas pendientes</p>
              <p className="text-sm text-muted-foreground">Todos los documentos están al día</p>
            </div>
          ) : (
            <>
              {unreadAlerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-red-600">Alertas Nuevas ({unreadAlerts.length})</h3>
                  {unreadAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`border rounded-lg p-3 ${
                        alert.alert_type === "expired" ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getAlertIcon(alert.alert_type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{getAlertMessage(alert)}</p>
                            <p className="text-xs text-muted-foreground">
                              Vence: {new Date(alert.expiration_date).toLocaleDateString("es-ES")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: es })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {getAlertBadge(alert.alert_type)}
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => markAsRead(alert.id)}>
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {readAlerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-600">Alertas Leídas ({readAlerts.length})</h3>
                  {readAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-3 opacity-60">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getAlertIcon(alert.alert_type)}
                          <div className="flex-1">
                            <p className="text-sm">{getAlertMessage(alert)}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: es })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {getAlertBadge(alert.alert_type)}
                          <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {readAlerts.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{readAlerts.length - 5} alertas más leídas
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
