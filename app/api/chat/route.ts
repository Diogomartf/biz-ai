// app/api/chat/route.ts
import { NextRequest } from "next/server";
import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1].content;

    const result = await streamText({
      model: groq("llama3-70b-8192"),
      prompt: latestMessage,
      maxTokens: 150,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error streaming from Groq:", error);
    return new Response(
      JSON.stringify({ error: "Failed to stream response" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
