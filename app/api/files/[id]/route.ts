// app/api/files/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db, files } from "@/lib/db";
import { pinecone, indexName } from "@/lib/pinecone";
import { eq } from "drizzle-orm";
import { generateEmbedding } from "@/lib/transformer";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id, 10);
  const deleted = await db
    .delete(files)
    .where(eq(files.id, idNumber))
    .returning();
  if (deleted.length === 0)
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  await pinecone.Index(indexName).deleteOne(idNumber.toString());
  return new NextResponse(null, { status: 204 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNumber = parseInt(id, 10);
  const { content, size, processed_data } = await req.json();
  const [updatedFile] = await db
    .update(files)
    .set({ content, size, processedData: processed_data })
    .where(eq(files.id, idNumber))
    .returning();
  if (!updatedFile)
    return NextResponse.json({ error: "File not found" }, { status: 404 });

  const embedding = await generateEmbedding(processed_data);
  await pinecone
    .Index(indexName)
    .upsert([
      {
        id: idNumber.toString(),
        values: embedding,
        metadata: { fileId: idNumber, size },
      },
    ]);
  return NextResponse.json(updatedFile, { status: 200 });
}
