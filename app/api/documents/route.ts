import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const documentData = await request.json()

    const { data, error } = await supabase
      .from("documents")
      .insert({
        document_type: documentData.document_type,
        category: documentData.category,
        entity_id: documentData.entity_id,
        file_url: documentData.file_url,
        file_name: documentData.file_name,
        file_size: documentData.file_size,
        file_type: documentData.file_type,
        expiration_date: documentData.expiration_date,
        issuer: documentData.issuer,
        document_number: documentData.document_number,
        notes: documentData.notes,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save document" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const entityId = searchParams.get("entity_id")

    let query = supabase.from("documents").select("*").eq("status", "active").order("created_at", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    if (entityId) {
      query = query.eq("entity_id", entityId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
