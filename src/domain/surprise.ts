/**
 * Surprise Me — picks a few items from across the user's recent activity
 * (graded drills, mental diets, watched videos, vault notes) and asks the
 * LLM for a non-obvious cross-domain connection.
 *
 * v1 sources what's in the vault adapter (graded/, mental-diet/, watched/).
 * When the real iCloud vault is wired, the sampling will widen automatically.
 */
import { llm, parseJsonLoose } from './llm';
import { getVault } from '@/vault/adapter';

export interface Surprise {
  items: { path: string; title: string; folder: string }[];
  connection: string;   // 1-2 paragraphs
  prompt: string;        // one concrete action
}

const SAMPLE_FOLDERS = [
  '01-CRAFT/writing/graded/',
  '00-INBOX/mental-diet/',
  '08-LIBRARY/watched/',
];

export async function generateSurprise(): Promise<Surprise> {
  const vault = await getVault();
  // Gather a handful of paths from each folder, shuffle, take 3.
  const buckets: string[][] = [];
  for (const f of SAMPLE_FOLDERS) {
    try {
      const files = (await vault.list(f)).filter(p => p.endsWith('.md'));
      if (files.length) buckets.push(files);
    } catch { /* folder doesn't exist yet, skip */ }
  }
  if (buckets.length === 0) {
    return {
      items: [],
      connection: 'Not enough material in your vault yet — submit a few drills, generate a mental diet, or watch a video, then come back.',
      prompt: 'Submit one drill first.',
    };
  }

  // Pick one from each bucket up to 3
  const picks: string[] = [];
  for (const b of buckets.slice(0, 3)) {
    picks.push(b[Math.floor(Math.random() * b.length)]);
  }

  // Read first 1000 chars of each
  const samples: { path: string; folder: string; title: string; body: string }[] = [];
  for (const p of picks) {
    try {
      const raw = await vault.read(p);
      const titleMatch = raw.match(/^#\s+(.+)$/m);
      samples.push({
        path: p,
        folder: p.split('/').slice(0, 2).join('/'),
        title: titleMatch?.[1] ?? p.split('/').pop()!.replace('.md', ''),
        body: raw.slice(0, 1200),
      });
    } catch { /* unreadable, skip */ }
  }

  const prompt = `You are a serendipity engine over the user's second brain.

Below are 3 random items from different parts of the user's vault. Find the NON-OBVIOUS connection between them — a structural parallel, a hidden principle, a productive tension, or a transfer move where a technique from one domain belongs in another. Avoid the obvious "they're all about X" — reach.

${samples.map((s, i) => `=== ITEM ${i + 1} — ${s.folder} ===\nTitle: ${s.title}\n\n${s.body}`).join('\n\n')}

Return ONLY this JSON:
{
  "connection": "1-2 paragraphs naming the non-obvious link between the items",
  "prompt": "one concrete action this connection suggests the user take today"
}`;

  const text = await llm({
    user: prompt,
    system: 'You connect distant ideas with precision. Output strict JSON only.',
    mode: 'json',
    temperature: 0.85,
  });
  const json = parseJsonLoose(text);
  return {
    items: samples.map(s => ({ path: s.path, title: s.title, folder: s.folder })),
    connection: String(json.connection ?? ''),
    prompt: String(json.prompt ?? ''),
  };
}
