/**
 * AI drill generator — produces a fresh drill on demand for any lane + skill.
 *
 * Used by Speech Gym ("generate a drill") and the writing studio ("Halbert-flavor
 * drill in copy"). Returns a normalized drill shape the existing drill runners
 * can render.
 */
import { llm, parseJsonLoose } from './llm';

export type DrillLane = 'speech' | 'fiction' | 'copy' | 'freeform';

export interface GeneratedDrill {
  id: string;
  lane: DrillLane;
  title: string;
  technique: string;
  prompt: string;
  minutes: number;
  skill: string;
}

export async function generateDrill(input: {
  lane: DrillLane;
  skill?: string;        // e.g. 'articulation', 'headline', 'interiority'
  author?: string;       // e.g. 'halbert', 'meyer'
  focus?: string;        // user's own context: "I get rambly under pressure"
  minutes?: number;
}): Promise<GeneratedDrill> {
  const minutes = input.minutes ?? 5;
  const authorLine = input.author ? `Style after ${input.author}'s signature moves.` : '';
  const skillLine = input.skill ? `Train the specific instrument of: ${input.skill}.` : '';
  const focusLine = input.focus ? `User's stated weakness or context: "${input.focus}".` : '';

  const prompt = `Generate ONE fresh ${input.lane} drill.

${skillLine}
${authorLine}
${focusLine}
Time budget: ${minutes} minutes.

Drill must:
- Have a punchy title (≤ 6 words)
- Have a technique line — what to focus on while doing it
- Have an actionable prompt — exactly what the user does, step by step
- Be specific enough that someone could execute it without asking follow-up questions

Return ONLY this JSON:
{
  "title": "...",
  "technique": "one-sentence what to focus on",
  "prompt": "step-by-step what to do",
  "minutes": ${minutes},
  "skill": "${input.skill ?? 'general'}"
}`;

  const text = await llm({
    system: 'You are a master drill designer for writers and speakers. Output strict JSON only.',
    user: prompt,
    mode: 'json',
    temperature: 0.9,
  });
  const json = parseJsonLoose(text);
  return {
    id: 'gen_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4),
    lane: input.lane,
    title: String(json.title ?? 'Untitled drill'),
    technique: String(json.technique ?? ''),
    prompt: String(json.prompt ?? ''),
    minutes: Number(json.minutes) || minutes,
    skill: String(json.skill ?? input.skill ?? 'general'),
  };
}
