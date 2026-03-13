import "dotenv/config";
import { Readable } from "node:stream";

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

export async function callOpenRouterChat({
  model,
  messages,
  temperature = 0.2,
  maxTokens = 1024,
  responseFormat,
}) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const body = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    ...(responseFormat && { response_format: responseFormat }),
  };

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.OPENROUTER_APP_URL || "http://localhost",
      "X-Title": process.env.OPENROUTER_APP_NAME || "Agentic RAG App",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `OpenRouter error: ${res.status} ${res.statusText} - ${errorText}`,
    );
  }

  const json = await res.json();
  const msg = json.choices?.[0]?.message;
  // Only use content if it's a string; tool_calls is not parseable JSON
  const content =
    typeof msg?.content === "string" ? msg.content : "";

  return { raw: json, content };
}

/**
 * Streaming chat - returns a Node.js Readable stream of SSE chunks.
 * Use for real-time token-by-token delivery.
 */
export async function callOpenRouterChatStream({
  model,
  messages,
  temperature = 0.2,
  maxTokens = 1024,
}) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const body = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: true,
  };

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.OPENROUTER_APP_URL || "http://localhost",
      "X-Title": process.env.OPENROUTER_APP_NAME || "Agentic RAG App",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `OpenRouter error: ${res.status} ${res.statusText} - ${errorText}`,
    );
  }

  return Readable.fromWeb(res.body);
}

