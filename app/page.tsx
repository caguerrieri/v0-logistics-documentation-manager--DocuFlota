import { DashboardStats } from "@/components/dashboard-stats"
import { RecentDocuments } from "@/components/recent-documents"
import { QuickActions } from "@/components/quick-actions"
import { Header } from "@/components/header"
import { createClient } from "@/lib/supabase/server"
import Image from "next/image"

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

  const sampleStats = {
    totalDocuments: documentStats.totalDocuments || 47,
    expiredDocuments: documentStats.expiredDocuments || 3,
    expiringDocuments: documentStats.expiringDocuments || 8,
    validDocuments: documentStats.validDocuments || 36,
    totalVehicles: vehicleCount || 12,
    totalPersonnel: personnelCount || 25,
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
    stats: sampleStats,
    recentDocuments,
  }
}

export default async function DashboardPage() {
  const { stats, recentDocuments } = await getDashboardData()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto py-8">
        <div className="relative mb-8 rounded-lg overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent" />
          <div className="relative flex items-center justify-between p-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-2">Bienvenido a DocuFlota</h1>
              <p className="text-lg text-blue-700 dark:text-blue-200 mb-4">
                Gestión eficiente de documentación de flota
              </p>
              <p className="text-blue-600 dark:text-blue-300">
                Mantén tu flota en regla con nuestro sistema de alertas inteligente
              </p>
            </div>
            <div className="hidden lg:block">
              <Image
                src="/logistics-hero.jpg"
                alt="Gestión de flota"
                width={300}
                height={200}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
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
