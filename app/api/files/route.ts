// app/api/files/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const files = db.prepare("SELECT * FROM files").all();
    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, size, processed_data } = await req.json();
    const stmt = db.prepare(
      "INSERT INTO files (content, size, processed_data) VALUES (?, ?, ?)"
    );
    const result = stmt.run(content, size, processed_data);
    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
