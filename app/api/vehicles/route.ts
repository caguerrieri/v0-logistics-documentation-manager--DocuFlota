import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get vehicles with their documents
    const { data: vehicles, error: vehiclesError } = await supabase.from("vehicles").select("*").order("license_plate")

    if (vehiclesError) {
      console.error("Database error:", vehiclesError)
      return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
    }

    // Get documents for each vehicle
    const vehiclesWithDocuments = await Promise.all(
      vehicles.map(async (vehicle) => {
        const { data: documents } = await supabase
          .from("documents")
          .select("*")
          .eq("category", "vehicle")
          .eq("entity_id", vehicle.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })

        // Calculate document status
        const now = new Date()
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

        const documentsWithStatus =
          documents?.map((doc) => {
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
          ...vehicle,
          documents: documentsWithStatus,
        }
      }),
    )

    return NextResponse.json(vehiclesWithDocuments)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const vehicleData = await request.json()

    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        license_plate: vehicleData.license_plate,
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        vehicle_type: vehicleData.vehicle_type,
        status: vehicleData.status || "active",
        notes: vehicleData.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
