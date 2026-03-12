import "dotenv/config";

export const config = {
  server: {
    port: process.env.PORT || 3000,
  },
  llm: {
    provider: "openrouter",
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || "qwen/qwen-2.5-32b-instruct",
    examModel:
      process.env.OPENROUTER_EXAM_MODEL ||
      "nvidia/nemotron-3-nano-30b-a3b:free",
    questionsModel:
      process.env.OPENROUTER_QUESTIONS_MODEL ||
      process.env.OPENROUTER_MODEL ||
      "qwen/qwen-2.5-32b-instruct",
    temperature: Number(process.env.OPENROUTER_TEMPERATURE ?? 0.2),
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    index: process.env.PINECONE_INDEX,
    embeddingModel: "llama-text-embed-v2",
  },
  langsmith: {
    tracing: process.env.LANGSMITH_TRACING === "true",
    endpoint: process.env.LANGSMITH_ENDPOINT,
    apiKey: process.env.LANGSMITH_API_KEY,
    project: process.env.LANGSMITH_PROJECT,
  },
  upload: {
    maxFileSize: 25 * 1024 * 1024,
    allowedTypes: ["application/pdf"],
    allowedExtensions: [".pdf"],
  },
  ingestion: {
    chunkSize: 1000,
    chunkOverlap: 200,
    batchSize: 96,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
};
