// app/api/files/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db, files } from "@/lib/db";
import { pinecone, indexName, ensureIndexExists } from "@/lib/pinecone";
import { generateEmbedding } from "@/lib/transformer";

export async function GET() {
  const allFiles = await db.select().from(files);
  return NextResponse.json(allFiles, { status: 200 });
}

export async function POST(req: NextRequest) {
  const { content, size, processed_data } = await req.json();
  const [newFile] = await db
    .insert(files)
    .values({ content, size, processedData: processed_data })
    .returning();

  const embedding = await generateEmbedding(processed_data);
  await ensureIndexExists();
  await pinecone.Index(indexName).upsert([
    {
      id: newFile.id.toString(),
      values: embedding,
      metadata: { fileId: newFile.id, size },
    },
  ]);

  return NextResponse.json(newFile, { status: 201 });
}
