/**
 * The 5 SOVEREIGN archetypes and their XP / level math.
 *
 * Level curve: xpForLevel(n) = round(100 * n^1.6)
 *   Lvl 1 = 100, Lvl 10 = 3,981, Lvl 47 ≈ 33,000.
 *
 * Drill submissions award XP to the archetype matched by lane/author
 * (see archetypeForDrill below).
 */
export type ArchetypeSlug = 'executor' | 'warrior' | 'creator' | 'maestro' | 'leader';

export interface Archetype {
  slug: ArchetypeSlug;
  name: string;
  jp: string;
  oneLiner: string;
  quote: string;
  seedXp?: number;  // starting XP for first-launch seeding
}

export const DEFAULT_ARCHETYPES: Archetype[] = [
  {
    slug: 'executor', name: 'Executor', jp: '執行者',
    oneLiner: 'Discipline and shipping. Closes the loop.',
    quote: "I don't need motivation. I need results.",
  },
  {
    slug: 'warrior',  name: 'Warrior',  jp: '戦士',
    oneLiner: 'Body. Training. Pressure tolerance.',
    quote: 'The body is the boss of the mind.',
  },
  {
    slug: 'creator',  name: 'Creator',  jp: '創造者',
    oneLiner: 'Brand, content, taste. Ships ideas into the world.',
    quote: 'Make something they cannot ignore.',
  },
  {
    slug: 'maestro',  name: 'Maestro',  jp: '巨匠',
    oneLiner: 'Mastery and craft. The long arc of a discipline.',
    quote: 'Repetition is the mother of skill.',
  },
  {
    slug: 'leader',   name: 'Leader',   jp: '指導者',
    oneLiner: 'Influence, presence, command of self and room.',
    quote: 'The first lead is yourself.',
  },
];

export function getArchetype(slug: ArchetypeSlug): Archetype {
  return DEFAULT_ARCHETYPES.find(a => a.slug === slug) ?? DEFAULT_ARCHETYPES[0];
}

/** Level curve: cumulative XP needed to be at level n.
 *  Lvl 0 = 0 XP (you start here). Lvl 1 = 100 XP. Lvl 47 ≈ 33k XP. */
export function xpForLevel(n: number): number {
  if (n <= 0) return 0;
  return Math.round(100 * Math.pow(n, 1.6));
}

/** Inverse — given total XP, return level + how-much-into-this-level. */
export function levelForXp(xp: number): { level: number; xpInLevel: number; xpToNext: number } {
  let level = 0;
  while (xpForLevel(level + 1) <= xp) level++;
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, xpInLevel: xp - base, xpToNext: next - base };
}

/** Map a drill to the archetype it feeds XP into. */
export function archetypeForDrill(args: { lane: string; author?: string }): ArchetypeSlug {
  if (args.lane === 'copy') return 'creator';      // copy + Halbert work feeds the Creator
  if (args.lane === 'fiction') return 'maestro';   // fiction + Meyer-style craft feeds the Maestro
  return 'executor';                                // freeform + everything else = Executor
}
