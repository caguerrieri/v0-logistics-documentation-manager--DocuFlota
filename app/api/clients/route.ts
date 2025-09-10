import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get clients with their requirements
    const { data: clients, error: clientsError } = await supabase.from("clients").select("*").order("name")

    if (clientsError) {
      console.error("Database error:", clientsError)
      return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
    }

    // Get requirements for each client
    const clientsWithRequirements = await Promise.all(
      clients.map(async (client) => {
        const { data: requirements } = await supabase
          .from("client_requirements")
          .select("*")
          .eq("client_id", client.id)
          .order("document_type")

        // Calculate compliance status for each requirement
        const requirementsWithStatus = await Promise.all(
          (requirements || []).map(async (req) => {
            if (!req.is_required) {
              return { ...req, compliance_status: "compliant" }
            }

            // Check if we have valid documents for this requirement
            const { data: documents } = await supabase
              .from("documents")
              .select("*")
              .eq("document_type", req.document_type)
              .eq("status", "active")
              .order("created_at", { ascending: false })
              .limit(1)

            if (!documents || documents.length === 0) {
              return { ...req, compliance_status: "missing" }
            }

            const document = documents[0]
            if (!document.expiration_date) {
              return { ...req, compliance_status: "compliant", expiration_date: null }
            }

            const now = new Date()
            const expirationDate = new Date(document.expiration_date)
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

            let compliance_status: "compliant" | "expiring" | "expired" = "compliant"

            if (expirationDate < now) {
              compliance_status = "expired"
            } else if (expirationDate <= thirtyDaysFromNow) {
              compliance_status = "expiring"
            }

            return {
              ...req,
              compliance_status,
              expiration_date: document.expiration_date,
              document_id: document.id,
            }
          }),
        )

        return {
          ...client,
          requirements: requirementsWithStatus,
        }
      }),
    )

    return NextResponse.json(clientsWithRequirements)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { requirements, ...clientData } = await request.json()

    // Create client
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({
        name: clientData.name,
        contact_person: clientData.contact_person || null,
        email: clientData.email || null,
        phone: clientData.phone || null,
        status: clientData.status || "active",
        notes: clientData.notes || null,
      })
      .select()
      .single()

    if (clientError) {
      console.error("Database error:", clientError)
      return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
    }

    // Create requirements
    if (requirements && Object.keys(requirements).length > 0) {
      const requirementInserts = Object.entries(requirements)
        .filter(([, isRequired]) => isRequired)
        .map(([documentType]) => ({
          client_id: client.id,
          document_type: documentType,
          is_required: true,
        }))

      if (requirementInserts.length > 0) {
        const { error: requirementsError } = await supabase.from("client_requirements").insert(requirementInserts)

        if (requirementsError) {
          console.error("Requirements error:", requirementsError)
          // Don't fail the whole operation, just log the error
        }
      }
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
