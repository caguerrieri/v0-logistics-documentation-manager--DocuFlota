import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertTriangle } from "lucide-react"

interface TrafficLightIndicatorProps {
  status: "valid" | "expiring" | "expired"
  daysUntilExpiration?: number
}

export function TrafficLightIndicator({ status, daysUntilExpiration }: TrafficLightIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "valid":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          label: "Vigente",
        }
      case "expiring":
        return {
          icon: Clock,
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          label: `Vence en ${daysUntilExpiration} días`,
        }
      case "expired":
        return {
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          label: "Vencido",
        }
      default:
        return {
          icon: CheckCircle,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          label: "Desconocido",
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge variant="secondary" className={`${config.bgColor} ${config.textColor} flex items-center gap-1`}>
      <Icon className={`h-3 w-3 ${config.color}`} />
      {config.label}
    </Badge>
  )
}
