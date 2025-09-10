import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get personnel with their documents
    const { data: personnel, error: personnelError } = await supabase.from("personnel").select("*").order("first_name")

    if (personnelError) {
      console.error("Database error:", personnelError)
      return NextResponse.json({ error: "Failed to fetch personnel" }, { status: 500 })
    }

    // Get documents for each person
    const personnelWithDocuments = await Promise.all(
      personnel.map(async (person) => {
        const { data: documents } = await supabase
          .from("documents")
          .select("*")
          .eq("category", "personnel")
          .eq("entity_id", person.id)
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
          ...person,
          documents: documentsWithStatus,
        }
      }),
    )

    return NextResponse.json(personnelWithDocuments)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const personnelData = await request.json()

    const { data, error } = await supabase
      .from("personnel")
      .insert({
        first_name: personnelData.first_name,
        last_name: personnelData.last_name,
        document_number: personnelData.document_number,
        phone: personnelData.phone || null,
        email: personnelData.email || null,
        position: personnelData.position,
        status: personnelData.status || "active",
        notes: personnelData.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create personnel" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
