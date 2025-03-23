// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { retrieveRelevantData } from "@/lib/retrieve";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

// Rough token estimation: 1 token ≈ 4 chars
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Truncate text to a target token count
function truncateText(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "... [truncated]";
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    console.log("Incoming messages:", JSON.stringify(messages, null, 2));

    const userQuery = messages[messages.length - 1].content;
    if (!userQuery) {
      throw new Error("No user query found in messages");
    }

    // Retrieve relevant data from Pinecone
    const relevantFiles = await retrieveRelevantData(userQuery, 3);
    let context = relevantFiles
      .map(file => {
        // Truncate each file's processed_data to ~1,000 tokens
        const truncatedData = truncateText(file.processedData, 1000);
        return `File ID: ${file.id}\nContent: ${truncatedData}\nScore: ${file.score}`;
      })
      .join("\n\n");

    // Further limit context to ~4,000 tokens total
    const maxContextTokens = 4000;
    const contextTokens = estimateTokens(context);
    console.log("Estimated context tokens:", contextTokens);
    if (contextTokens > maxContextTokens) {
      context = truncateText(context, maxContextTokens);
      console.log(
        "Context truncated to ~4,000 tokens, new length:",
        context.length
      );
    }

    // Construct system prompt
    const systemPrompt = {
      role: "system",
      content: `You are a helpful AI assistant. Use the following context from uploaded files to answer the user's query:\n\n${context}\n\nIf the context is insufficient, rely on your general knowledge.`,
    };

    // Normalize messages
    const normalizedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Estimate total tokens (system + user messages + max output)
    const totalTokens =
      estimateTokens(systemPrompt.content) +
      normalizedMessages.reduce(
        (sum, msg) => sum + estimateTokens(msg.content),
        0
      ) +
      1000; // Reserve for completion
    console.log("Estimated total tokens:", totalTokens);

    // Check against TPM and context limits
    const tpmLimit = 6000;
    const contextLimit = 8192;
    if (totalTokens > tpmLimit) {
      throw new Error(
        `Request exceeds TPM limit: ${totalTokens} > ${tpmLimit}`
      );
    }
    if (totalTokens > contextLimit) {
      throw new Error(
        `Request exceeds context limit: ${totalTokens} > ${contextLimit}`
      );
    }

    // Send to Groq
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [systemPrompt, ...normalizedMessages],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat", details: String(error) },
      { status: 500 }
    );
  }
}
