import "server-only";

export async function validateGroqKey(key: string) {
  let response: Response;
  try {
    response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000)
    });
  } catch {
    throw new Error("Could not reach Groq to verify this key. Try again later.");
  }
  if (response.status === 401 || response.status === 403) throw new Error("Groq rejected this key. Check it and try again.");
  if (response.status === 429) throw new Error("Groq is rate limiting requests. Try again later.");
  if (!response.ok) throw new Error("Groq could not verify this key right now.");
}
