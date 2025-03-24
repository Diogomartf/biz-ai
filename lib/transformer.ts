// lib/transformer.ts
import { AutoModel, AutoTokenizer, env } from "@huggingface/transformers";
import * as fs from "fs";

// Set up cache directory
const cacheDir = process.env.TRANSFORMERS_CACHE || "/tmp/.cache/huggingface";
try {
  fs.mkdirSync(cacheDir, { recursive: true });
  console.log(`Cache directory created at: ${cacheDir}`);
} catch (error) {
  console.warn(
    `Warning: Failed to create cache directory: ${
      error instanceof Error ? error.message : String(error)
    }`
  );
}

// Set cache environment variable programmatically
env.cacheDir = cacheDir;

// Disable local models for remote inference
env.allowLocalModels = false;

let model: AutoModel | null = null;
let tokenizer: AutoTokenizer | null = null;

async function initializeModel() {
  if (!model || !tokenizer) {
    console.log("Initializing tokenizer...");
    tokenizer = await AutoTokenizer.from_pretrained(
      "sentence-transformers/all-MiniLM-L6-v2"
    );
    console.log("Tokenizer initialized:", !!tokenizer);
    console.log("Initializing model...");
    model = await AutoModel.from_pretrained(
      "sentence-transformers/all-MiniLM-L6-v2"
    );
    console.log("Model initialized:", !!model);
  }
}

// Mean pooling to convert token embeddings to sentence embedding
function meanPooling(
  tokenEmbeddings: Float32Array[],
  attentionMask: bigint[]
): number[] {
  const embeddingDim = tokenEmbeddings[0].length; // e.g., 384
  const sentenceEmbedding = new Array(embeddingDim).fill(0);
  let totalWeight = 0;

  for (let i = 0; i < tokenEmbeddings.length; i++) {
    const weight = Number(attentionMask[i]); // Convert bigint to number
    totalWeight += weight;
    for (let j = 0; j < embeddingDim; j++) {
      sentenceEmbedding[j] += tokenEmbeddings[i][j] * weight;
    }
  }

  if (totalWeight > 0) {
    for (let j = 0; j < embeddingDim; j++) {
      sentenceEmbedding[j] /= totalWeight;
    }
  }

  console.log("Sentence embedding length:", sentenceEmbedding.length);
  console.log("Sample embedding values:", sentenceEmbedding.slice(0, 5));
  return sentenceEmbedding;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  await initializeModel();

  if (!tokenizer || !model) {
    throw new Error("Failed to initialize model or tokenizer");
  }

  // Define a more specific type for the tokenizer and model functions
  type TokenizerFn = (
    text: string,
    options: {
      padding: boolean;
      truncation: boolean;
      return_tensors: string;
    }
  ) => Record<string, { data: unknown[] }>;

  type ModelFn = (inputs: ReturnType<TokenizerFn>) => Promise<{
    last_hidden_state: { data: unknown[] };
  }>;

  // Cast with more specific function types
  const tokenizerFn = tokenizer as unknown as TokenizerFn;
  const modelFn = model as unknown as ModelFn;

  // Tokenize input
  const inputs = tokenizerFn(text, {
    padding: true,
    truncation: true,
    return_tensors: "pt",
  });
  console.log("Inputs tokenized:", !!inputs);

  // Get model output (hidden states)
  const outputs = await modelFn(inputs);
  console.log("Model outputs:", !!outputs);

  // Extract last hidden state (token embeddings)
  const tokenEmbeddings = outputs.last_hidden_state.data; // Shape: [1, seq_len, 384]
  const attentionMask = inputs.attention_mask.data; // Shape: [1, seq_len], bigint values
  console.log("Token embeddings length:", tokenEmbeddings.length);
  console.log("Attention mask length:", attentionMask.length);

  // Convert to arrays and apply mean pooling
  // Assuming tokenEmbeddings is a flat array that needs to be chunked into embeddings
  const embeddingDim = 384; // Adjust if needed
  const sequenceLength = attentionMask.length;
  const embeddingsArray: Float32Array[] = [];

  // Create properly typed arrays
  for (let i = 0; i < sequenceLength; i++) {
    const start = i * embeddingDim;
    // Create a properly typed Float32Array from the slice
    const embedding = new Float32Array(embeddingDim);
    for (let j = 0; j < embeddingDim; j++) {
      if (start + j < tokenEmbeddings.length) {
        embedding[j] = Number(tokenEmbeddings[start + j]);
      }
    }
    embeddingsArray.push(embedding);
  }

  const maskArray = Array.from(attentionMask).map(val => BigInt(Number(val)));

  return meanPooling(embeddingsArray, maskArray);
}
