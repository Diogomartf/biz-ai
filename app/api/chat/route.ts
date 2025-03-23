// app/api/files/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db";

export async function GET() {
  try {
    const allFiles = await db.select().from(files);
    return NextResponse.json(allFiles, { status: 200 });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, size, processed_data } = await req.json();
    const [newFile] = await db
      .insert(files)
      .values({ content, size, processedData: processed_data })
      .returning();
    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json(
      { error: "Failed to save file", details: String(error) },
      { status: 500 }
    );
  }
}
