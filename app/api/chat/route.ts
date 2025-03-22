// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  try {
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt: message, // Using prompt for simplicity; can switch to messages later
      maxTokens: 150,
    });

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Error calling Groq:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
