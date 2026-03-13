import { PineconeStore } from "@langchain/pinecone";
import { PineconeEmbeddings } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { config } from "../config/index.js";

export class VectorRepository {
  constructor() {
    this.vectorStore = null;
  }

  async getVectorStore() {
    if (this.vectorStore) return this.vectorStore;

    const { apiKey, index, embeddingModel } = config.pinecone;

    if (!apiKey) {
      throw new Error("Missing PINECONE_API_KEY");
    }
    if (!index) {
      throw new Error("Missing PINECONE_INDEX");
    }

    const pc = new PineconeClient({ apiKey });
    const pineconeIndex = pc.Index(index);

    const embeddings = new PineconeEmbeddings({
      model: embeddingModel,
    });

    this.vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
    });

    return this.vectorStore;
  }

  /** @param {string} [namespace] - User namespace for isolation (e.g. user_${userId}) */
  async search(query, limit = 10, namespace) {
    const store = await this.getVectorStore();
    const filter = namespace ? { namespace: `user_${namespace}` } : undefined;
    return await store.similaritySearch(query, limit, filter);
  }

  /** @param {string} [namespace] - User namespace for isolation (e.g. userId or user_${userId}) */
  async addDocuments(documents, namespace) {
    const store = await this.getVectorStore();
    const ns = namespace ? `user_${namespace}` : undefined;
    return await store.addDocuments(documents, ns ? { namespace: ns } : undefined);
  }
}
