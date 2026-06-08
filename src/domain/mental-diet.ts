/**
 * Mental Diet — daily intellectual feed in 4 slots:
 *   Write · Study · Watch · Think
 *
 * LLM generates a single coherent menu with a through-line connecting all 4.
 * Cached per-day in localStorage so reload doesn't re-roll.
 */
import { llm, parseJsonLoose } from './llm';
import { getVault } from '@/vault/adapter';

export interface MentalDiet {
  date: string;          // YYYY-MM-DD
  throughLine: string;   // 1 sentence linking the 4 slots
  write: { title: string; prompt: string; format: string; minutes: number; connect: string };
  study: { suggestion: string; angle: string };
  watch: { creatorType: string; lens: string };
  think: string;
}

const CACHE_KEY = (d: string) => `sovereign.diet.${d}`;

function today(): string { return new Date().toISOString().slice(0, 10); }

export function getCachedDiet(date = today()): MentalDiet | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY(date));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function cacheDiet(d: MentalDiet) {
  localStorage.setItem(CACHE_KEY(d.date), JSON.stringify(d));
}

export async function generateDiet(opts: { topic?: string } = {}): Promise<MentalDiet> {
  const date = today();
  const prompt = `You are designing today's "Mental Diet" — a personalized intellectual feed for the user. Generate FOUR linked slots that share a through-line:

1. WRITE — a long-form writing prompt (real piece, not a 5-min drill). Specify a title, the prompt itself, format (essay / thread / VSL / scene), estimated minutes, and one sentence connecting it to the user's current work.
2. STUDY — a single deep-read suggestion (could be a topic, a book chapter, a thinker's idea — pick one). Include the angle to read it through today.
3. WATCH — directional: a TYPE of creator/channel to seek out (NOT a specific URL). Include the lens to watch it through.
4. THINK — one specific synthesis question that connects everything in 3-5.

${opts.topic ? `Bias all 4 slots around the topic: "${opts.topic}".` : 'No specific topic — pick something interesting.'}

The user is Zatreides, a copywriter/creative running an agency. Active interests: VSL copywriting (Halbert school), fiction craft (Stephenie Meyer interiority), cold email, brand building, neuroscience of performance.

Return ONLY this JSON, no prose:
{
  "throughLine": "one sentence the 4 slots share",
  "write": { "title": "...", "prompt": "what to write", "format": "essay/thread/VSL/scene", "minutes": 30, "connect": "why this matters now" },
  "study": { "suggestion": "what to read", "angle": "lens for today" },
  "watch": { "creatorType": "type of creator/channel", "lens": "lens to watch through" },
  "think": "one specific synthesis question"
}`;

  const text = await llm({
    user: prompt,
    system: 'You are an editorial intelligence curating a daily intellectual feed. Output strict JSON. No prose, no markdown fences.',
    mode: 'json',
    temperature: 0.85,
  });
  const json = parseJsonLoose(text);
  const diet: MentalDiet = {
    date,
    throughLine: String(json.throughLine ?? ''),
    write: {
      title:   String(json.write?.title ?? ''),
      prompt:  String(json.write?.prompt ?? ''),
      format:  String(json.write?.format ?? ''),
      minutes: Number(json.write?.minutes ?? 30),
      connect: String(json.write?.connect ?? ''),
    },
    study: {
      suggestion: String(json.study?.suggestion ?? ''),
      angle:      String(json.study?.angle ?? ''),
    },
    watch: {
      creatorType: String(json.watch?.creatorType ?? ''),
      lens:        String(json.watch?.lens ?? ''),
    },
    think: String(json.think ?? ''),
  };
  cacheDiet(diet);
  // Also save to the vault for the user's later reference
  saveDietToVault(diet).catch(() => {});
  return diet;
}

async function saveDietToVault(d: MentalDiet) {
  const vault = await getVault();
  const path = `00-INBOX/mental-diet/${d.date}.md`;
  const md = `---
title: Mental Diet — ${d.date}
tags: [mental-diet, daily]
---

# Mental Diet — ${d.date}

**Through-line:** ${d.throughLine}

## ✍️  Write
**${d.write.title}** · ${d.write.format} · ${d.write.minutes} min
${d.write.prompt}

*Connect:* ${d.write.connect}

## 📖  Study
**${d.study.suggestion}**
${d.study.angle}

## 📺  Watch
**${d.watch.creatorType}**
${d.watch.lens}

## 🔥  Think
${d.think}
`;
  await vault.write(path, md);
}
