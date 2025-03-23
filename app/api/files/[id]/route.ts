// app/api/files/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db, files } from "@/lib/db"; // Named imports
import { eq } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNumber = parseInt(id, 10);

    if (isNaN(idNumber)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }
    const deleted = await db
      .delete(files)
      .where(eq(files.id, idNumber))
      .returning();
    if (deleted.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNumber = parseInt(id, 10);

    if (isNaN(idNumber)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }
    const { content, size, processed_data } = await req.json();
    const [updatedFile] = await db
      .update(files)
      .set({ content, size, processedData: processed_data })
      .where(eq(files.id, idNumber))
      .returning();
    if (!updatedFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    return NextResponse.json(updatedFile, { status: 200 });
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json(
      { error: "Failed to update file", details: String(error) },
      { status: 500 }
    );
  }
}
