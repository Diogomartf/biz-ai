// app/api/files/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
    }
    const stmt = db.prepare("DELETE FROM files WHERE id = ?");
    const result = stmt.run(id);
    if (result.changes === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
