// lib/retrieve.ts
import { pinecone, indexName } from "./pinecone";
import { db, files } from "./db";
import { inArray } from "drizzle-orm";
import { generateEmbedding } from "./transformer";

export async function retrieveRelevantData(query: string, topK: number = 3) {
  const queryEmbedding = await generateEmbedding(query);
  const index = pinecone.Index(indexName);
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  const fileIds = results.matches.map(match => Number(match.id));
  let relevantFiles;
  if (fileIds.length === 0) {
    relevantFiles = [];
  } else {
    relevantFiles = await db
      .select()
      .from(files)
      .where(inArray(files.id, fileIds));
  }

  return relevantFiles.map(file => ({
    id: file.id,
    content: file.content,
    processedData: file.processedData,
    score: results.matches.find(m => m.id === file.id.toString())?.score || 0,
  }));
}
