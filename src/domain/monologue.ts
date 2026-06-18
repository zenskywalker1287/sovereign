/**
 * Monologue generator — given a context + voice + length, produce a speakable
 * monologue text and per-line delivery notes.
 */
import { llm, parseJsonLoose } from './llm';

export interface MonologueResult {
  title: string;
  durationSec: number;
  text: string;          // the speakable monologue, paragraph-separated
  notes: string[];       // delivery + pacing notes
}

export const PRESET_CONTEXTS = [
  'Closing the sale to a hesitant buyer',
  'Wedding toast for a best friend',
  'Pitching investors on a wild idea',
  'Rallying a tired team',
  'A eulogy for someone admired',
  'Confronting a difficult truth with someone you love',
  'A TED-style explanation of one big idea',
  'Calling someone out without burning the bridge',
  'Owning a mistake to your team',
  'The cold-open of an interview',
] as const;

export const VOICES = [
  { label: 'Your own voice', value: 'self' },
  { label: 'As Steve Jobs',  value: 'Steve Jobs' },
  { label: 'As Gary Halbert', value: 'Gary Halbert' },
  { label: 'As MLK Jr.',     value: 'Martin Luther King Jr.' },
  { label: 'As Winston Churchill', value: 'Winston Churchill' },
  { label: 'As a poet',      value: 'a contemporary poet' },
  { label: 'As an old friend', value: 'an old friend' },
] as const;

export async function generateMonologue(input: {
  context: string;
  voice: string;          // 'self' or a person/character name
  durationSec: number;    // 60 / 120 / 180
}): Promise<MonologueResult> {
  const voiceLine = input.voice === 'self'
    ? 'Write in the user\'s own natural voice — confident, warm, specific.'
    : `Write in the voice of ${input.voice}. Use their cadence, vocabulary, and signature moves.`;

  const wordTarget = Math.round((input.durationSec / 60) * 150);

  const prompt = `Generate a speakable monologue.

CONTEXT: ${input.context}
TARGET LENGTH: ~${input.durationSec} seconds (~${wordTarget} words at a natural pace)
${voiceLine}

Rules:
- Real spoken language. Contractions. Short sentences. Sentence fragments OK.
- Hit the reader's throat in the first line.
- One concrete image or specific detail per paragraph (no abstractions).
- Pause-friendly cadence (natural breath points).
- Close with a stab line ≤ 6 words.
- NO stage directions inline. Put them in the notes array.

Return ONLY this JSON:
{
  "title": "short title",
  "durationSec": ${input.durationSec},
  "text": "the monologue, paragraph-separated",
  "notes": ["3-6 delivery notes — pacing, where to slow, where to land hardest"]
}`;

  const text = await llm({
    system: 'You are a master speechwriter. Write to be SPOKEN, not read. Output strict JSON only.',
    user: prompt,
    mode: 'json',
    temperature: 0.85,
  });
  const json = parseJsonLoose(text);
  return {
    title: String(json.title ?? 'Monologue'),
    durationSec: Number(json.durationSec) || input.durationSec,
    text: String(json.text ?? ''),
    notes: Array.isArray(json.notes) ? json.notes.slice(0, 8).map(String) : [],
  };
}
