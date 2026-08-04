import { HF_TOKEN, HF_MODEL } from '../../config/env.js';

const INFERENCE_URL = 'https://api-inference.huggingface.co';
const routerUrl = 'https://router.huggingface.co';

export const llmConfigured = () => Boolean(HF_TOKEN);

async function fetchJson(url, body, token) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HF API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function tryChatCompletions(token, messages, maxTokens) {
  const urls = [
    `${INFERENCE_URL}/v1/chat/completions`,
    `${INFERENCE_URL}/models/${HF_MODEL}/v1/chat/completions`,
    `${routerUrl}/chat/completions`,
  ];
  for (const url of urls) {
    try {
      const data = await fetchJson(
        url,
        { model: HF_MODEL, messages, max_tokens: maxTokens, temperature: 0.6 },
        token
      );
      const text = data?.choices?.[0]?.message?.content;
      if (text) return text;
    } catch {
      // try next endpoint
    }
  }
  return null;
}

async function tryTextGeneration(token, prompt, maxTokens) {
  try {
    const data = await fetchJson(
      `${INFERENCE_URL}/models/${HF_MODEL}`,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: 0.6,
          return_full_text: false,
        },
      },
      token
    );
    const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
    return text || null;
  } catch {
    return null;
  }
}

/**
 * Optionally augments a reply with a hosted LLM. Returns null when the LLM
 * is not configured or unreachable so callers can fall back to the engine.
 */
export async function augmentWithLLM({ message, products, engineReply, role }) {
  if (!llmConfigured()) return null;
  try {
    const productSummary = (products || [])
      .map((p, i) => `${i + 1}. ${p.name} — $${p.price}/${p.unit} (${p.fabricType || p.category}, stock ${p.stock})`)
      .join('\n');

    const system =
      role === 'supplier'
        ? 'You are Weaver, an assistant helping a fabric supplier run their textile marketplace. Be concise, practical, and friendly.'
        : 'You are Weaver, an AI fabric sourcing assistant for a B2B textile marketplace. Help buyers find fabrics. Ground every claim in the provided product data. Be concise (max 3 sentences), friendly, and offer a next step.';

    const prompt = `Catalog data:\n${productSummary || 'No products matched.'}\n\nQuestion: ${message}\n\nEngine draft: ${engineReply}`;

    const text = await tryChatCompletions(tokenFn(), [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ], 180);
    if (text) return text.trim();

    return await tryTextGeneration(tokenFn(), `${system}\n\n${prompt}\n\nAssistant:`, 180);
  } catch {
    return null;
  }
}

function tokenFn() {
  return HF_TOKEN;
}
