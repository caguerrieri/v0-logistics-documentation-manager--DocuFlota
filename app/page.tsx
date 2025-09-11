import { DashboardStats } from "@/components/dashboard-stats"
import { RecentDocuments } from "@/components/recent-documents"
import { QuickActions } from "@/components/quick-actions"
import { Header } from "@/components/header"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

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
        <div className="relative mb-8 rounded-xl overflow-hidden bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950 border border-blue-100 dark:border-blue-800">
          <div className="relative flex items-center justify-between p-6 lg:p-8">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl lg:text-4xl font-bold text-blue-900 dark:text-blue-100 mb-3">
                Tu flota siempre en regla
              </h1>
              <p className="text-lg text-blue-700 dark:text-blue-200 mb-4 leading-relaxed">
                Gestión inteligente de documentos con alertas automáticas y control en tiempo real.
              </p>
              <p className="text-blue-600 dark:text-blue-300 mb-6">
                Olvidate de vencimientos, centralizá todo en un solo lugar y evitá riesgos innecesarios.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/fleet"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg w-full sm:w-auto text-center inline-block"
                >
                  Gestionar Documentos
                </Link>
                <Link
                  href="/fleet"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg w-full sm:w-auto text-center inline-block"
                >
                  Comenzar ahora
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center ml-8">
              <div className="relative">
                <div className="w-32 h-32 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-blue-600 dark:text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                  </svg>
                </div>
              </div>
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
