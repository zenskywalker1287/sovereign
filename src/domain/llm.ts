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

async function gemini({ system, user, modelId, key, temperature = 0.7, mode = 'text', fileUri }:
  LLMCall & { modelId: string; key: string }): Promise<string> {
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
  if (!resp.ok) throw new LLMError(data?.error?.message ?? resp.statusText);
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
