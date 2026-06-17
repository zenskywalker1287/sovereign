/**
 * One generic LLM call surface. Reads settings (provider + key + model)
 * and dispatches to OpenRouter or Gemini. Used by grading, mental-diet,
 * surprise-me, and watch.
 *
 * Two response modes:
 *   - 'text': returns a plain string
 *   - 'json': forces JSON output (response_format / responseMimeType) and parses it
 */
import { getSettings, MODELS } from './grading';

export type LLMMode = 'text' | 'json';

export interface LLMCall {
  system?: string;
  user: string;
  /** Override the user's chosen model (e.g. Watch needs Gemini for video). */
  modelOverride?: { provider: 'openrouter' | 'gemini'; modelId: string };
  temperature?: number;
  mode?: LLMMode;
  /** Optional inline file (e.g. a YouTube URL for Gemini video understanding). */
  fileUri?: string;
}

export class LLMError extends Error {}
export class MissingKeyError extends LLMError {
  constructor(public provider: 'openrouter' | 'gemini') { super(`No ${provider} key`); }
}

export async function llm(call: LLMCall): Promise<string> {
  const s = getSettings();
  const chosen = MODELS.find(m => m.id === s.modelId) ?? MODELS[0];
  const provider = call.modelOverride?.provider ?? chosen.provider;
  const modelId = call.modelOverride?.modelId ?? chosen.id;
  const key = provider === 'openrouter' ? s.openrouterKey : s.geminiKey;
  if (!key) throw new MissingKeyError(provider);

  if (provider === 'openrouter') return openrouter({ ...call, modelId, key });
  return gemini({ ...call, modelId, key });
}

async function openrouter({ system, user, modelId, key, temperature = 0.7, mode = 'text' }:
  LLMCall & { modelId: string; key: string }): Promise<string> {
  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': 'https://sovereign.app',
      'X-Title': 'SOVEREIGN',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: user },
      ],
      ...(mode === 'json' ? { response_format: { type: 'json_object' } } : {}),
      temperature,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new LLMError(data?.error?.message ?? resp.statusText);
  return data.choices?.[0]?.message?.content ?? '';
}

// Models we try in order when the requested Gemini model returns 503 "high demand".
// `gemini-flash-latest` is fast + cheap when up, but frequently capacity-throttled.
// `gemini-2.5-flash` is more stable in our testing.
const GEMINI_FALLBACK_CHAIN = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash'];

async function gemini({ system, user, modelId, key, temperature = 0.7, mode = 'text', fileUri }:
  LLMCall & { modelId: string; key: string }): Promise<string> {
  // Build a fallback chain starting with the user's requested model.
  // If the request fails with 503 "high demand", we transparently try the next model.
  const tried = new Set<string>();
  const chain = [modelId, ...GEMINI_FALLBACK_CHAIN.filter(m => m !== modelId)];
  let lastErr: any;

  for (const candidate of chain) {
    if (tried.has(candidate)) continue;
    tried.add(candidate);
    try {
      return await geminiCall(candidate, key, user, system, temperature, mode, fileUri);
    } catch (e: any) {
      lastErr = e;
      const msg = String(e?.message ?? '').toLowerCase();
      // Only fall through on capacity/availability errors; bail on auth/billing.
      if (!msg.includes('high demand') && !msg.includes('overloaded') && !msg.includes('503')) {
        throw e;
      }
    }
  }
  throw lastErr ?? new LLMError('All Gemini models failed');
}

async function geminiCall(modelId: string, key: string, user: string, system: string | undefined,
                          temperature: number, mode: LLMMode, fileUri: string | undefined): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${key}`;
  const parts: any[] = [{ text: user }];
  if (fileUri) parts.push({ fileData: { fileUri } });
  const body: any = {
    contents: [{ parts }],
    generationConfig: { temperature, ...(mode === 'json' ? { responseMimeType: 'application/json' } : {}) },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (!resp.ok) {
    // Attach status code to the message so the chain wrapper can detect 503.
    const detail = data?.error?.message ?? resp.statusText;
    throw new LLMError(`${resp.status}: ${detail}`);
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

/** Strip ```json fences and parse, with last-resort regex fallback. */
export function parseJsonLoose(text: string): any {
  if (!text) throw new LLMError('Empty response');
  const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  try { return JSON.parse(stripped); }
  catch {
    const m = stripped.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new LLMError('Model did not return parseable JSON');
  }
}
