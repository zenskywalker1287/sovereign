/**
 * Graded history reader — lists everything in 01-CRAFT/writing/graded/
 * from the vault adapter and parses the frontmatter + filename to surface
 * date, drill, lane, and score for the history view.
 */
import { getVault } from '@/vault/adapter';
import matter from 'gray-matter';

export interface GradedEntry {
  path: string;
  date: string;     // YYYY-MM-DD from frontmatter or filename
  drill: string;
  lane: string;
  total: number;    // /60 or /100
  max: number;
  signatureName?: string;
}

const FOLDER = '01-CRAFT/writing/graded/';

export async function listGraded(): Promise<GradedEntry[]> {
  const vault = await getVault();
  const all = await vault.list(FOLDER);
  const md = all.filter(p => p.endsWith('.md'));
  const entries: GradedEntry[] = [];
  for (const p of md) {
    try {
      const raw = await vault.read(p);
      const { data } = matter(raw);
      const total = parseScore(data.total ?? data.universal_score ?? '0/60');
      entries.push({
        path: p,
        date: String(data.date ?? extractDateFromPath(p)),
        drill: String(data.drill ?? extractDrillFromPath(p)),
        lane: String(data.lane ?? '—'),
        total: total.score,
        max: total.max,
        signatureName: data.target_author && data.target_author !== 'none' ? String(data.target_author) : undefined,
      });
    } catch { /* skip unreadable */ }
  }
  entries.sort((a, b) => (a.date < b.date ? 1 : -1));
  return entries;
}

function parseScore(raw: any): { score: number; max: number } {
  const s = String(raw);
  const m = s.match(/(\d+)\s*\/\s*(\d+)/);
  if (m) return { score: Number(m[1]), max: Number(m[2]) };
  return { score: Number(s) || 0, max: 60 };
}

function extractDateFromPath(p: string): string {
  return p.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? '';
}
function extractDrillFromPath(p: string): string {
  const m = p.match(/\d{4}-\d{2}-\d{2}_([a-z0-9-]+)_/i);
  return m?.[1] ?? '';
}
