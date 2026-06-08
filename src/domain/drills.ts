/**
 * Drill Bank — every writing exercise the app can serve, in one typed catalog.
 * Mirrors the vault's `01-CRAFT/writing/drills/_drill-bank.md` but is loaded
 * at compile time so the UI doesn't need vault round-trips to render the picker.
 *
 * Each drill has: lane (fiction/copy/freeform), skill it trains, time budget,
 * a one-line prompt, and optional author tag (for ID-style bootcamp drills).
 */
export type Lane = 'fiction' | 'copy' | 'freeform';
export type Skill =
  | 'rhythm' | 'sensory' | 'word-choice' | 'interiority' | 'restraint' | 'specificity'
  | 'headline' | 'hook' | 'claim-stripping' | 'voice' | 'offer' | 'rewrite';

export interface Drill {
  id: string;
  lane: Lane;
  title: string;
  prompt: string;
  skill: Skill;
  minutes: number;
  author?: 'meyer' | 'halbert' | 'hopkins' | 'ogilvy' | 'carlton';
}

export const DRILLS: Drill[] = [
  // ── FICTION (Stephenie Meyer + general) ──
  { id: 'fic-interiority-pair',  lane: 'fiction', skill: 'interiority',  minutes: 5,
    title: 'The Interiority Pair',
    prompt: 'Write 6 sentences, 3 external-action / internal-response pairs. Every action is followed by a body-located internal reaction.',
    author: 'meyer' },
  { id: 'fic-body-sentence',     lane: 'fiction', skill: 'sensory',      minutes: 5,
    title: 'The Body Sentence',
    prompt: 'Pick an emotion. Convey it ONLY through physical sensation. No naming the emotion.' },
  { id: 'fic-jagged-edge',       lane: 'fiction', skill: 'rhythm',       minutes: 5,
    title: 'The Jagged Edge',
    prompt: 'Write 6 sentences alternating short-medium-long-short-long-stab. Read aloud. Does it sing?' },
  { id: 'fic-restraint-impulse', lane: 'fiction', skill: 'restraint',    minutes: 10,
    title: 'Restraint–Impulse',
    prompt: 'Write a 100-word passage where the narrator has an impulse (italicized command to themselves) and physically fails to obey it.',
    author: 'meyer' },
  { id: 'fic-compressed-metaphor', lane: 'fiction', skill: 'word-choice', minutes: 5,
    title: 'Compressed Metaphor',
    prompt: 'Write 5 metaphors in "the X of Y" form. No similes ("like" / "as"). Make each one earn its place.',
    author: 'meyer' },
  { id: 'fic-stab-ending', lane: 'fiction', skill: 'rhythm', minutes: 5,
    title: 'The Stab Ending',
    prompt: 'Write a 60-word paragraph where the final sentence is 4 words or fewer.' },

  // ── COPY (Gary Halbert + foundational copywriters) ──
  { id: 'cp-halbert-headlines',  lane: 'copy',    skill: 'headline',     minutes: 15,
    title: 'Halbert: 10 Headlines',
    prompt: 'Pick one product. Write 10 versions of its headline. Mix benefits, curiosity, news, fear, story, contrarian. The 11th is for the client; the first 10 are practice.',
    author: 'halbert' },
  { id: 'cp-halbert-grabber',    lane: 'copy',    skill: 'hook',         minutes: 10,
    title: 'Halbert: First Sentence Grabbers',
    prompt: 'Write 8 opening sentences for the same product. Each one must make the reader unable to look away. Stories. Confessions. Questions. Stats.',
    author: 'halbert' },
  { id: 'cp-hopkins-claim-strip', lane: 'copy',   skill: 'claim-stripping', minutes: 10,
    title: 'Hopkins: Strip the Claim',
    prompt: 'Find a piece of marketing copy. Strip every claim that isn\'t specific or provable. Rewrite using only what you could legally back up.',
    author: 'hopkins' },
  { id: 'cp-carlton-voice',      lane: 'copy',    skill: 'voice',        minutes: 10,
    title: 'Carlton: Talk Like You Talk',
    prompt: 'Record yourself explaining the product to a friend for 60 seconds. Transcribe. Now use ONLY phrases you actually said. Cut everything that sounds "written".',
    author: 'carlton' },
  { id: 'cp-ogilvy-research',    lane: 'copy',    skill: 'specificity',  minutes: 15,
    title: 'Ogilvy: 100 Facts',
    prompt: 'List 100 hyper-specific facts about the product. Materials, history, manufacturing, the founder\'s breakfast. The best headline is hiding in there.',
    author: 'ogilvy' },
  { id: 'cp-offer-stack',        lane: 'copy',    skill: 'offer',        minutes: 10,
    title: 'The Offer Stack',
    prompt: 'Write the offer 5 different ways. Risk reversal. Bonus stack. Scarcity. Comparison. Outcome-only. Pick the one that makes you want to buy it yourself.' },
  { id: 'cp-cold-email-nesb',    lane: 'copy',    skill: 'hook',         minutes: 15,
    title: 'N.E.S.B. Cold Email',
    prompt: 'Write a 90-word cold email applying the N.E.S.B. framework (Novel, Easy, Safe, Big). Subject line included. Pretend the recipient has 12 seconds.' },

  // ── FREEFORM ──
  { id: 'free-morning-pages',    lane: 'freeform', skill: 'rewrite',     minutes: 15,
    title: 'Morning Pages',
    prompt: 'Write three pages of whatever. Don\'t stop. Don\'t edit. This is mental flossing, not output.' },
  { id: 'free-one-thing',        lane: 'freeform', skill: 'specificity', minutes: 10,
    title: 'The One Thing',
    prompt: 'Write 500 words on the most important thing happening in your life right now. Be specific. Be honest. No abstractions.' },
];

export function drillsByLane(lane: Lane): Drill[] {
  return DRILLS.filter(d => d.lane === lane);
}
export function drillById(id: string): Drill | undefined {
  return DRILLS.find(d => d.id === id);
}
