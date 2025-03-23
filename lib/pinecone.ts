// lib/pinecone.ts
import { Pinecone } from "@pinecone-database/pinecone";

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const indexName = "bizai-files";

export async function ensureIndexExists() {
  const indexList = await pinecone.listIndexes();
  const indexes = indexList.indexes || [];
  if (!indexes.some(index => index.name === indexName)) {
    await pinecone.createIndex({
      name: indexName,
      dimension: 384, // all-MiniLM-L6-v2 embedding size
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });
    // Wait for index to be ready
    await new Promise(resolve => setTimeout(resolve, 60000));
  }
}
