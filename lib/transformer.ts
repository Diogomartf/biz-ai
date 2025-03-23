// lib/transformer.ts
import { AutoModel, AutoTokenizer, env } from "@huggingface/transformers";

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
  attentionMask: BigInt[]
): number[] {
  const embeddingDim = tokenEmbeddings[0].length; // e.g., 384
  const sentenceEmbedding = new Array(embeddingDim).fill(0);
  let totalWeight = 0;

  for (let i = 0; i < tokenEmbeddings.length; i++) {
    const weight = Number(attentionMask[i]); // Convert BigInt to number
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

  // Tokenize input
  const inputs = tokenizer!(text, {
    padding: true,
    truncation: true,
    return_tensors: "pt",
  });
  console.log("Inputs tokenized:", !!inputs);

  // Get model output (hidden states)
  const outputs = await model!(inputs);
  console.log("Model outputs:", !!outputs);

  // Extract last hidden state (token embeddings)
  const tokenEmbeddings = outputs.last_hidden_state.data; // Shape: [1, seq_len, 384]
  const attentionMask = inputs.attention_mask.data; // Shape: [1, seq_len], BigInt values
  console.log("Token embeddings length:", tokenEmbeddings.length);
  console.log("Attention mask length:", attentionMask.length);

  // Convert to arrays and apply mean pooling
  const embeddingsArray = Array.from(tokenEmbeddings).reduce(
    (acc: Float32Array[], _, i) => {
      if (i % 384 === 0)
        acc.push(new Float32Array(tokenEmbeddings.slice(i, i + 384)));
      return acc;
    },
    []
  );
  const maskArray = Array.from(attentionMask) as BigInt[];

  return meanPooling(embeddingsArray, maskArray);
}
