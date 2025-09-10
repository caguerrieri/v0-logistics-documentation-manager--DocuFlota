import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const clientId = params.id

    // Get requirements for the client
    const { data: requirements, error } = await supabase
      .from("client_requirements")
      .select("*")
      .eq("client_id", clientId)
      .order("document_type")

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch requirements" }, { status: 500 })
    }

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

    return NextResponse.json(requirementsWithStatus)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
