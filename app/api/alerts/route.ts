import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")

    let query = supabase.from("alerts").select("*").order("created_at", { ascending: false })

    if (limit) {
      query = query.limit(Number.parseInt(limit))
    }

    const { data: alerts, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
    }

    return NextResponse.json(alerts || [])
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // This endpoint generates alerts for documents that are expiring or expired
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const fifteenDaysFromNow = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Get all active documents with expiration dates
    const { data: documents, error: documentsError } = await supabase
      .from("documents")
      .select("*")
      .eq("status", "active")
      .not("expiration_date", "is", null)

    if (documentsError) {
      console.error("Documents error:", documentsError)
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
    }

    const alertsToCreate = []

    for (const doc of documents || []) {
      const expirationDate = new Date(doc.expiration_date)
      let alertType: string | null = null

      // Check if document is expired
      if (expirationDate < now) {
        alertType = "expired"
      }
      // Check if document expires in 7 days
      else if (expirationDate <= sevenDaysFromNow) {
        alertType = "expiring_7"
      }
      // Check if document expires in 15 days
      else if (expirationDate <= fifteenDaysFromNow) {
        alertType = "expiring_15"
      }
      // Check if document expires in 30 days
      else if (expirationDate <= thirtyDaysFromNow) {
        alertType = "expiring_30"
      }

      if (alertType) {
        // Check if alert already exists for this document and alert type
        const { data: existingAlert } = await supabase
          .from("alerts")
          .select("id")
          .eq("document_id", doc.id)
          .eq("alert_type", alertType)
          .single()

        if (!existingAlert) {
          // Get entity name based on category
          let entityName = doc.entity_id
          if (doc.category === "vehicle") {
            const { data: vehicle } = await supabase
              .from("vehicles")
              .select("license_plate")
              .eq("id", doc.entity_id)
              .single()
            entityName = vehicle?.license_plate || doc.entity_id
          } else if (doc.category === "personnel") {
            const { data: personnel } = await supabase
              .from("personnel")
              .select("first_name, last_name")
              .eq("id", doc.entity_id)
              .single()
            entityName = personnel ? `${personnel.first_name} ${personnel.last_name}` : doc.entity_id
          }

          alertsToCreate.push({
            document_id: doc.id,
            document_type: doc.document_type,
            entity_type: doc.category,
            entity_id: doc.entity_id,
            entity_name: entityName,
            alert_type: alertType,
            expiration_date: doc.expiration_date,
            is_read: false,
          })
        }
      }
    }

    if (alertsToCreate.length > 0) {
      const { error: insertError } = await supabase.from("alerts").insert(alertsToCreate)

      if (insertError) {
        console.error("Insert error:", insertError)
        return NextResponse.json({ error: "Failed to create alerts" }, { status: 500 })
      }
    }

    return NextResponse.json({ created: alertsToCreate.length })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
