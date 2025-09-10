import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const alertId = params.id
    const { is_read } = await request.json()

    const { error } = await supabase.from("alerts").update({ is_read }).eq("id", alertId)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update alert" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const alertId = params.id

    const { error } = await supabase.from("alerts").delete().eq("id", alertId)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
