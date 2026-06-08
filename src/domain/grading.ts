/**
 * Grading engine — TS port of the /grade-me skill.
 *
 * Scores a piece of writing against:
 *   1. Universal rubric (6 dimensions × /10 = /60)
 *   2. Optional author signature rubric (/40) — Meyer for fiction, Halbert for copy
 *
 * Implementation: calls Gemini (gemini-flash-latest) with a structured prompt
 * and parses the JSON response. The API key is loaded from settings; if absent,
 * grading returns a stub explaining why.
 */
import type { Drill } from './drills';

export interface DimensionScore {
  name: string;
  score: number;     // 0–10
  evidence: string;  // a quoted line from the piece
  reason: string;
}
export interface GradeResult {
  universal: DimensionScore[];
  universalSubtotal: number;     // /60
  signature?: DimensionScore[];
  signatureSubtotal?: number;    // /40
  signatureName?: string;        // e.g. "Stephenie Meyer"
  total: number;                 // /60 or /100
  whatsWorking: string[];        // 3 quotes
  whatsBreaking: string[];       // 3 quotes
  weakestDimension: string;
  revisionInstruction: string;
  date: string;                  // YYYY-MM-DD
  stub?: string;                 // if grading couldn't run, explanation
}

const UNIVERSAL_DIMS = [
  { key: 'rhythm',      label: 'Rhythm' },
  { key: 'sensory',     label: 'Sensory Density' },
  { key: 'word-choice', label: 'Word Choice' },
  { key: 'interiority', label: 'Interiority Balance' },
  { key: 'restraint',   label: 'Restraint' },
  { key: 'specificity', label: 'Specificity' },
];

const MEYER_SIG = [
  { key: 'interiority-pairing',   label: 'Interiority Pairing' },
  { key: 'body-first-emotion',    label: 'Body-First Emotion' },
  { key: 'restraint-impulse',     label: 'Restraint–Impulse Rhythm' },
  { key: 'compressed-metaphor',   label: 'Compressed Metaphor' },
];

const HALBERT_SIG = [
  { key: 'grabber',         label: 'First-Sentence Grabber' },
  { key: 'plain-talk',      label: 'Plain-Talk Voice' },
  { key: 'specificity',     label: 'Hyper-Specificity' },
  { key: 'reader-stakes',   label: 'Reader Stakes (so what?)' },
];

/* ───────────── Provider / model config ─────────────
 * Two providers supported: OpenRouter (default) and Gemini.
 * OpenRouter unlocks free-tier open-source models (Llama 3.3 70B, DeepSeek,
 * Qwen) without billing setup. Gemini is still here for users who already
 * have a paid key or want video features.
 */
export type Provider = 'openrouter' | 'gemini';

export interface ModelChoice {
  id: string;
  label: string;
  provider: Provider;
  hint?: string;
}
export const MODELS: ModelChoice[] = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B (free)',          provider: 'openrouter', hint: 'Default. Strong reasoning, fast.' },
  { id: 'deepseek/deepseek-chat-v3.1:free',       label: 'DeepSeek V3.1 (free)',          provider: 'openrouter', hint: 'Best reasoning, slower.' },
  { id: 'qwen/qwen-2.5-72b-instruct:free',        label: 'Qwen 2.5 72B (free)',           provider: 'openrouter', hint: 'Solid alt, multilingual.' },
  { id: 'google/gemini-2.0-flash-exp:free',       label: 'Gemini 2.0 Flash (via OR free)',provider: 'openrouter', hint: 'Google through OpenRouter.' },
  { id: 'gemini-flash-latest',                    label: 'Gemini Flash (direct)',         provider: 'gemini',     hint: 'Uses Gemini key directly.' },
];
export const DEFAULT_MODEL_ID = MODELS[0].id;

interface Settings { provider: Provider; modelId: string; openrouterKey: string; geminiKey: string; openaiKey: string; }
const SETTINGS_KEY = 'sovereign.grading.settings.v1';

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch {}
  // legacy migration
  try {
    const legacyGemini = localStorage.getItem('sovereign.gemini.apiKey') ?? '';
    if (legacyGemini) return { ...defaults(), geminiKey: legacyGemini };
  } catch {}
  return defaults();
}
export function saveSettings(s: Partial<Settings>) {
  const merged = { ...getSettings(), ...s };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
}
function defaults(): Settings {
  return { provider: 'openrouter', modelId: DEFAULT_MODEL_ID, openrouterKey: '', geminiKey: '', openaiKey: '' };
}

export async function gradePiece(piece: string, drill: Drill): Promise<GradeResult> {
  if (piece.trim().length < 40) return stubResult(piece, drill, 'Piece too short to grade meaningfully (under 40 chars).');

  const settings = getSettings();
  const model = MODELS.find(m => m.id === settings.modelId) ?? MODELS[0];
  const provider = model.provider;

  // resolve the right key for the chosen provider
  const key = provider === 'openrouter' ? settings.openrouterKey : settings.geminiKey;
  if (!key) return stubResult(piece, drill, `No ${provider === 'openrouter' ? 'OpenRouter' : 'Gemini'} API key set. Open Profile → Settings.`);

  const authorSig = drill.author === 'meyer' ? { name: 'Stephenie Meyer', dims: MEYER_SIG } :
                    drill.author === 'halbert' ? { name: 'Gary Halbert', dims: HALBERT_SIG } :
                    null;
  const prompt = buildPrompt(piece, drill, authorSig);

  let json: any;
  try {
    json = provider === 'openrouter'
      ? await callOpenRouter(model.id, key, prompt)
      : await callGemini(model.id, key, prompt);
  } catch (e) {
    return stubResult(piece, drill, `Grading failed: ${(e as Error).message}`);
  }
  return shapeResult(json, authorSig);
}

async function callOpenRouter(modelId: string, key: string, prompt: string): Promise<any> {
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
        { role: 'system', content: 'You are a writing critic. Respond ONLY with valid JSON matching the schema in the user message. No markdown fences, no prose.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error?.message ?? resp.statusText);
  const text = data.choices?.[0]?.message?.content ?? '';
  return safeParseJson(text);
}

async function callGemini(modelId: string, key: string, prompt: string): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${key}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error?.message ?? resp.statusText);
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return safeParseJson(text);
}

/** Open-source models sometimes wrap JSON in ```json fences. Strip and recover. */
function safeParseJson(text: string): any {
  if (!text) throw new Error('Empty model response');
  const stripped = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  try { return JSON.parse(stripped); }
  catch {
    // last resort: try to find the first { ... } block
    const m = stripped.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Model did not return valid JSON');
  }
}

function buildPrompt(piece: string, drill: Drill, sig: { name: string; dims: typeof MEYER_SIG } | null): string {
  return `You are a writing critic for the SOVEREIGN writing bootcamp. Grade this piece against the universal rubric below, and (if provided) the author signature rubric. Be HONEST — most first drafts score 35–45/60. Quote evidence from the piece for every score.

DRILL: ${drill.title}
PROMPT: ${drill.prompt}
LANE: ${drill.lane}

PIECE:
"""
${piece}
"""

UNIVERSAL RUBRIC (score each /10):
${UNIVERSAL_DIMS.map(d => `- ${d.label}`).join('\n')}

${sig ? `AUTHOR SIGNATURE RUBRIC — ${sig.name} (score each /10):\n${sig.dims.map(d => `- ${d.label}`).join('\n')}\n` : ''}

Return ONLY this JSON, no prose:
{
  "universal": [{"name": "...", "score": 0-10, "evidence": "exact quoted line from the piece", "reason": "one sentence why this score"}],
  ${sig ? '"signature": [{"name": "...", "score": 0-10, "evidence": "...", "reason": "..."}],' : ''}
  "whatsWorking": ["quote 1 — why it works", "quote 2 — why it works", "quote 3 — why it works"],
  "whatsBreaking": ["quote 1 — why it fails", "quote 2 — why it fails", "quote 3 — why it fails"],
  "weakestDimension": "name of the single weakest dimension",
  "revisionInstruction": "ONE specific actionable instruction tied to a specific sentence in the piece"
}`;
}

function shapeResult(json: any, sig: { name: string; dims: typeof MEYER_SIG } | null): GradeResult {
  const universal: DimensionScore[] = (json.universal ?? []).slice(0, 6).map((d: any) => ({
    name: String(d.name ?? ''),
    score: clamp(Number(d.score) || 0, 0, 10),
    evidence: String(d.evidence ?? ''),
    reason: String(d.reason ?? ''),
  }));
  const universalSubtotal = universal.reduce((s, d) => s + d.score, 0);
  let signature: DimensionScore[] | undefined;
  let signatureSubtotal: number | undefined;
  if (sig && Array.isArray(json.signature)) {
    const dims: DimensionScore[] = json.signature.slice(0, 4).map((d: any) => ({
      name: String(d.name ?? ''),
      score: clamp(Number(d.score) || 0, 0, 10),
      evidence: String(d.evidence ?? ''),
      reason: String(d.reason ?? ''),
    }));
    signature = dims;
    signatureSubtotal = dims.reduce((s, d) => s + d.score, 0);
  }
  const total = universalSubtotal + (signatureSubtotal ?? 0);
  return {
    universal,
    universalSubtotal,
    signature,
    signatureSubtotal,
    signatureName: sig?.name,
    total,
    whatsWorking: (json.whatsWorking ?? []).slice(0, 3),
    whatsBreaking: (json.whatsBreaking ?? []).slice(0, 3),
    weakestDimension: String(json.weakestDimension ?? ''),
    revisionInstruction: String(json.revisionInstruction ?? ''),
    date: new Date().toISOString().slice(0, 10),
  };
}

function stubResult(_piece: string, drill: Drill, reason: string): GradeResult {
  const universal = UNIVERSAL_DIMS.map(d => ({ name: d.label, score: 0, evidence: '—', reason: '—' }));
  return {
    universal,
    universalSubtotal: 0,
    total: 0,
    whatsWorking: [],
    whatsBreaking: [],
    weakestDimension: '—',
    revisionInstruction: '—',
    date: new Date().toISOString().slice(0, 10),
    stub: reason,
    signatureName: drill.author ? authorNameOf(drill.author) : undefined,
  };
}
function authorNameOf(a: string) {
  return a === 'meyer'   ? 'Stephenie Meyer'
       : a === 'halbert' ? 'Gary Halbert'
       : a === 'hopkins' ? 'Claude Hopkins'
       : a === 'ogilvy'  ? 'David Ogilvy'
       : a === 'carlton' ? 'John Carlton'
       : '';
}
function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }

/* ───────── Save graded result back to the vault ───────── */
import { getVault } from '@/vault/adapter';

export async function saveGradedToVault(piece: string, drill: Drill, result: GradeResult): Promise<string> {
  const slug = drill.id.replace(/[^a-z0-9-]/gi, '-');
  const scoreLabel = result.signature ? `${result.total}-of-100` : `${result.total}-of-60`;
  const path = `01-CRAFT/writing/graded/${result.date}_${slug}_${scoreLabel}.md`;
  const md = renderGradedMarkdown(piece, drill, result);
  const vault = await getVault();
  await vault.write(path, md);
  return path;
}

function renderGradedMarkdown(piece: string, drill: Drill, r: GradeResult): string {
  const fm = [
    '---',
    `date: ${r.date}`,
    `drill: ${drill.id}`,
    `lane: ${drill.lane}`,
    r.signatureName ? `target_author: ${r.signatureName}` : 'target_author: none',
    `universal_score: ${r.universalSubtotal}/60`,
    r.signature ? `signature_score: ${r.signatureSubtotal}/40` : '',
    `total: ${r.total}/${r.signature ? 100 : 60}`,
    '---',
    '',
  ].filter(Boolean).join('\n');

  const dims = r.universal.map(d => `${d.name}: ${d.score}/10 — "${d.evidence}" — ${d.reason}`).join('\n');
  const sigDims = r.signature;
  const sig = sigDims
    ? `\n### Author Signature — ${r.signatureName}\n` +
      sigDims.map(d => `${d.name}: ${d.score}/10 — "${d.evidence}" — ${d.reason}`).join('\n')
    : '';

  return `${fm}
## The Piece

${piece}

## Grading

### Universal Rubric
${dims}
${sig}

## What's Working
${r.whatsWorking.map(q => `- ${q}`).join('\n')}

## What's Breaking
${r.whatsBreaking.map(q => `- ${q}`).join('\n')}

## Weakest Dimension
**${r.weakestDimension}**

## Revision Instruction
${r.revisionInstruction}
`;
}
