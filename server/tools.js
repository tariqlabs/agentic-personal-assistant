import { tool } from "langchain";
import { z } from "zod";
import { PineconeStore } from "@langchain/pinecone";
import { PineconeEmbeddings } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

let vectorStore;

const getVectorStore = async () => {
  if (vectorStore) return vectorStore;

  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX;

  if (!apiKey) {
    throw new Error("Missing PINECONE_API_KEY");
  }
  if (!indexName) {
    throw new Error("Missing PINECONE_INDEX");
  }

  const pc = new PineconeClient({ apiKey });
  const index = pc.Index(indexName);

  // This MUST match the embedding model used during ingestion
  const embeddings = new PineconeEmbeddings({
    model: "llama-text-embed-v2",
  });

  vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
  });

  return vectorStore;
};

export const searchKnowledgeBase = tool(
  async ({ query }) => {
    console.log(`🔍 Agent is searching Pinecone for: "${query}"`);

    const store = await getVectorStore();

    // We fetch the top 10 most similar chunks
    const results = await store.similaritySearch(query, 10);

    // For demo purposes
    results.forEach((r, i) => {
      console.log(`Result ${i + 1}:`, r.pageContent.slice(0, 200));
    });

    if (results.length === 0) {
      return "No relevant information found in the knowledge base.";
    }

    // Join the chunks so the LLM can read them as one context block
    return results.map((doc) => doc.pageContent).join("\n\n---\n\n");
  },
  {
    name: "search_knowledge_base",
    description:
      "Searches the internal knowledge base for technical info and documentation. Use this when you need to find information from uploaded PDF documents.",
    schema: z.object({
      query: z.string().describe("The search query to look up in the knowledge base"),
    }),
  }
);
