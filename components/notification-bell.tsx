"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, AlertTriangle, Clock } from "lucide-react"

interface Alert {
  id: string
  document_type: string
  entity_type: "vehicle" | "personnel"
  entity_name: string
  alert_type: "expiring_30" | "expiring_15" | "expiring_7" | "expired"
  is_read: boolean
}

export function NotificationBell() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
    // Set up polling for new alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts?limit=5")
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

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case "expired":
        return <AlertTriangle className="h-3 w-3 text-red-600" />
      case "expiring_7":
        return <Clock className="h-3 w-3 text-red-500" />
      case "expiring_15":
      case "expiring_30":
        return <Clock className="h-3 w-3 text-yellow-600" />
      default:
        return <Bell className="h-3 w-3 text-gray-500" />
    }
  }

  const getAlertMessage = (alert: Alert) => {
    const documentTypeLabels: Record<string, string> = {
      insurance: "Seguro",
      vtv: "VTV",
      drivers_license: "Licencia",
      vehicle_registration: "Cédula Verde",
      medical_certificate: "Cert. Médico",
      work_permit: "Permiso",
      other: "Documento",
    }

    const docType = documentTypeLabels[alert.document_type] || alert.document_type
    const entityType = alert.entity_type === "vehicle" ? "Veh." : "Pers."

    switch (alert.alert_type) {
      case "expired":
        return `${docType} de ${entityType} ${alert.entity_name} vencido`
      case "expiring_7":
        return `${docType} de ${entityType} ${alert.entity_name} vence en 7d`
      case "expiring_15":
        return `${docType} de ${entityType} ${alert.entity_name} vence en 15d`
      case "expiring_30":
        return `${docType} de ${entityType} ${alert.entity_name} vence en 30d`
      default:
        return `Alerta para ${entityType} ${alert.entity_name}`
    }
  }

  const unreadCount = alerts.filter((alert) => !alert.is_read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <DropdownMenuItem disabled>Cargando...</DropdownMenuItem>
        ) : alerts.length === 0 ? (
          <DropdownMenuItem disabled>No hay alertas</DropdownMenuItem>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <DropdownMenuItem
              key={alert.id}
              className={`flex items-start gap-2 p-3 ${!alert.is_read ? "bg-yellow-50" : ""}`}
              onClick={() => !alert.is_read && markAsRead(alert.id)}
            >
              {getAlertIcon(alert.alert_type)}
              <div className="flex-1">
                <p className="text-sm">{getAlertMessage(alert)}</p>
                {!alert.is_read && <div className="w-2 h-2 bg-red-500 rounded-full mt-1" />}
              </div>
            </DropdownMenuItem>
          ))
        )}
        {alerts.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-muted-foreground">
              Ver todas las alertas
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
