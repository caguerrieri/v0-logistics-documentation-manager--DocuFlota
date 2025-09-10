import { DashboardStats } from "@/components/dashboard-stats"
import { RecentDocuments } from "@/components/recent-documents"
import { QuickActions } from "@/components/quick-actions"
import { NotificationBell } from "@/components/notification-bell"
import { createClient } from "@/lib/supabase/server"

async function getDashboardData() {
  const supabase = await createClient()

  // Get document statistics
  const { data: documents } = await supabase.from("documents").select("*").eq("status", "active")

  // Get vehicle count
  const { count: vehicleCount } = await supabase.from("vehicles").select("*", { count: "exact", head: true })

  // Get personnel count
  const { count: personnelCount } = await supabase.from("personnel").select("*", { count: "exact", head: true })

  // Calculate document status
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const documentStats = documents?.reduce(
    (acc, doc) => {
      acc.totalDocuments++

      if (doc.expiration_date) {
        const expirationDate = new Date(doc.expiration_date)
        const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (expirationDate < now) {
          acc.expiredDocuments++
        } else if (expirationDate <= thirtyDaysFromNow) {
          acc.expiringDocuments++
        } else {
          acc.validDocuments++
        }
      } else {
        acc.validDocuments++
      }

      return acc
    },
    {
      totalDocuments: 0,
      expiredDocuments: 0,
      expiringDocuments: 0,
      validDocuments: 0,
    },
  ) || {
    totalDocuments: 0,
    expiredDocuments: 0,
    expiringDocuments: 0,
    validDocuments: 0,
  }

  // Get recent documents with status
  const recentDocuments =
    documents?.slice(0, 5).map((doc) => {
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
    }) || []

  return {
    stats: {
      ...documentStats,
      totalVehicles: vehicleCount || 0,
      totalPersonnel: personnelCount || 0,
    },
    recentDocuments,
  }
}

export default async function DashboardPage() {
  const { stats, recentDocuments } = await getDashboardData()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
            <NotificationBell />
          </div>
          <p className="text-gray-600">Gestión de documentación para empresas de logística</p>
        </div>

        <div className="space-y-8">
          <DashboardStats stats={stats} />

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentDocuments documents={recentDocuments} />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
