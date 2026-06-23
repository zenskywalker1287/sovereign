/**
 * Courses — structured training programs per domain.
 *
 * Mental model: Madden Ultimate Team. Each domain has numbered challenge sets.
 * Each set has numbered challenges. Each challenge has a clear objective and
 * an XP reward on completion. Sequential by default; user can jump around
 * but the recommended path is in order.
 *
 * Three top-level domains:
 *   - COPY     → Gary Halbert course (the Prince of Print)
 *   - FICTION  → Stephenie Meyer course (interiority + body-first)
 *   - SPEECH   → existing Speech Gym (own home page, links here for index parity)
 *
 * Each Challenge has a `type` that determines how it renders:
 *   - 'drill'   → a writing drill with title + technique + prompt + timer
 *   - 'read'    → opens a vault note in the Note Reader
 *   - 'chat'    → opens the persona chat (Halbert / Meyer)
 *   - 'monologue' → opens the Monologue generator (Speech only)
 */

import type { ArchetypeSlug } from './archetypes';

export type Domain = 'copy' | 'fiction' | 'speech';

export interface Challenge {
  id: string;
  number: string;       // e.g. "1.1", "1.2"
  title: string;
  brief: string;        // 1-line objective
  body: string;         // longer description / prompt
  type: 'drill' | 'read' | 'chat' | 'monologue';
  minutes: number;
  xp: number;
  archetype: ArchetypeSlug;
  /** For type='drill': the prompt + technique to render in the timed editor. */
  drill?: { technique: string; prompt: string };
  /** For type='read': vault path. */
  notePath?: string;
  /** For type='chat': persona key. */
  personaKey?: string;
}

export interface ChallengeSet {
  id: string;
  number: number;       // M1, M2, M3...
  title: string;
  hook: string;         // "Why this matters" — one line
  emoji: string;
  challenges: Challenge[];
}

export interface Course {
  id: string;
  domain: Domain;
  name: string;         // "Gary Halbert: The Copy Course"
  byline: string;       // "The Prince of Print"
  intro: string;
  emoji: string;
  sets: ChallengeSet[];
}

/* ──────────────────────────────────────────────────────────────
   HALBERT — COPY COURSE
   ────────────────────────────────────────────────────────────── */

export const HALBERT_COURSE: Course = {
  id: 'halbert',
  domain: 'copy',
  name: 'Halbert: The Copy Course',
  byline: 'Gary Halbert · The Prince of Print',
  intro: '4 modules. 24 challenges. Each one trains one of Halbert\'s signature moves.',
  emoji: '✉️',
  sets: [
    {
      id: 'grabber',
      number: 1,
      emoji: '🪝',
      title: 'The Grabber',
      hook: 'First sentence does one job: make the reader unable to look away.',
      challenges: [
        {
          id: 'hb-1-1', number: '1.1', type: 'read',
          title: 'Read: What makes a Halbert grabber',
          brief: 'The bootcamp note. 5 min.',
          body: 'Read the Halbert bootcamp. Pay attention to the four grabber patterns: confession, specific claim, story drop, direct address.',
          notePath: '01-CRAFT/writing/authors/gary-halbert.md',
          minutes: 5, xp: 10, archetype: 'creator',
        },
        {
          id: 'hb-1-2', number: '1.2', type: 'drill',
          title: '8 First-Sentence Grabbers',
          brief: 'Pick one product. Write 8 openers — each must yank the reader\'s throat out.',
          body: 'Pick one product (yours or fake). Write 8 different opening sentences. Mix the 4 patterns: confession, specific claim, story drop, direct address. Goal: every one of them makes the reader unable to stop.',
          drill: {
            technique: 'Threat-to-the-throat. If sentence 2 isn\'t pulled out by sentence 1, the grabber failed.',
            prompt: 'Pick one product. Write 8 first sentences. Patterns to mix:\n\n— Confession: "I\'ve never told anyone this, but…"\n— Specific claim: "On June 14th, 1986, I made $1,184,000."\n— Story drop: "Here\'s what happened when a 64-year-old chiropractor tried this."\n— Direct address: "Dear Friend, if you\'re tired of being broke, read this."',
          },
          minutes: 12, xp: 80, archetype: 'creator',
        },
        {
          id: 'hb-1-3', number: '1.3', type: 'chat',
          title: 'Halbert grades your grabbers',
          brief: 'Send your 8 grabbers to Halbert for a teardown.',
          body: 'Paste the 8 grabbers you just wrote. Halbert will pick the best, kill the weakest, and tell you why.',
          personaKey: 'halbert',
          minutes: 8, xp: 40, archetype: 'creator',
        },
        {
          id: 'hb-1-4', number: '1.4', type: 'drill',
          title: 'Confession-form grabber × 5',
          brief: 'Five openers in confession form only.',
          body: 'Same product, but ALL 5 openers must use the confession pattern. Goes deep on one tool.',
          drill: {
            technique: 'Lean low. Whisper-tone. The reader has to feel they\'re overhearing.',
            prompt: 'Write 5 first sentences in confession form ("I\'ve never told anyone this, but…", "Here\'s what I really think about…", "The truth is…"). Same product. Make each one specific to a different shame, secret, or hard-won lesson.',
          },
          minutes: 10, xp: 60, archetype: 'creator',
        },
      ],
    },
    {
      id: 'voice',
      number: 2,
      emoji: '🎙️',
      title: 'Plain-Talk Voice',
      hook: 'If a phrase makes you sound smart, cut it. If it makes you sound human, keep it twice.',
      challenges: [
        {
          id: 'hb-2-1', number: '2.1', type: 'drill',
          title: 'The Friend Text',
          brief: 'Rewrite corporate copy as a text to a friend.',
          body: 'Find a piece of corporate marketing copy (any brand). Rewrite the first paragraph as if you were texting your best friend about that product. Contractions. Fragments. Asides in parentheses.',
          drill: {
            technique: 'Read your rewrite aloud. If it still sounds "written," it failed.',
            prompt: 'Step 1: Find one paragraph of corporate marketing copy (any brand website).\nStep 2: Rewrite it as if texting your best friend.\nStep 3: Use contractions, sentence fragments, parenthetical asides.\nStep 4: Read both versions aloud. The rewrite should sound NOTHING like the original.',
          },
          minutes: 12, xp: 70, archetype: 'creator',
        },
        {
          id: 'hb-2-2', number: '2.2', type: 'drill',
          title: 'Dead Phrase Audit',
          brief: 'Find your defaults. Kill them.',
          body: 'Record yourself speaking on any topic for 2 minutes (Voice Memos). Transcribe it. Highlight every dead phrase. Rewrite the whole thing eliminating every one.',
          drill: {
            technique: 'Dead phrases hide in plain sight. "At the end of the day," "secret sauce," "leverage," "synergy."',
            prompt: '1. Record 2 minutes of yourself speaking about anything (your work, a memory, anything).\n2. Transcribe via Voice Memos or by listening.\n3. Highlight EVERY dead phrase.\n4. Rewrite the full transcript eliminating each one — find a specific, fresh phrase instead.',
          },
          minutes: 15, xp: 90, archetype: 'creator',
        },
        {
          id: 'hb-2-3', number: '2.3', type: 'chat',
          title: 'Halbert kills your dead phrases',
          brief: 'Paste any copy. He\'ll call out every dead phrase.',
          body: 'Paste any piece of copy (your own or other). Halbert will highlight every dead phrase, every "synergy" or "leverage" or "secret sauce," and rewrite the worst paragraph in his voice.',
          personaKey: 'halbert',
          minutes: 5, xp: 30, archetype: 'creator',
        },
      ],
    },
    {
      id: 'specificity',
      number: 3,
      emoji: '🔍',
      title: 'Hyper-Specificity',
      hook: 'Don\'t claim quality. Pile up evidence.',
      challenges: [
        {
          id: 'hb-3-1', number: '3.1', type: 'drill',
          title: '100 Facts About One Product',
          brief: 'The headline is hiding in there.',
          body: 'Pick a product. List 100 specific facts: materials, history, manufacturing, the founder\'s breakfast — anything specific. The best headline emerges from this list.',
          drill: {
            technique: 'No adjectives. Only verifiable facts. Specific names, numbers, dates, places.',
            prompt: 'Pick ONE product (yours or any you know well).\nWrite 100 specific facts about it. Examples to anchor:\n- "Made in the family\'s 1937 leather workshop in Florence"\n- "Stitched with #69 bonded nylon thread"\n- "Founder\'s grandfather was a saddler for the Italian cavalry"\n\nNo "high quality." No "premium." Only specifics that could be verified.',
          },
          minutes: 25, xp: 150, archetype: 'creator',
        },
        {
          id: 'hb-3-2', number: '3.2', type: 'drill',
          title: '10 Headlines from the 100 Facts',
          brief: 'Mine your fact list for headlines.',
          body: 'Take your 100 facts. Pull 10 headlines from them. Each headline should USE one or more specific facts directly.',
          drill: {
            technique: 'The 11th is for the client. The first 10 are practice.',
            prompt: 'Look at your 100 facts. Write 10 headlines, each one drawing on at least one specific fact from your list. Mix benefits, curiosity, news, story, fear, contrarian.',
          },
          minutes: 15, xp: 100, archetype: 'creator',
        },
      ],
    },
    {
      id: 'stakes',
      number: 4,
      emoji: '🎯',
      title: 'Reader Stakes (the "So What?" test)',
      hook: 'Every paragraph has to pay off the question: and what does that do for ME?',
      challenges: [
        {
          id: 'hb-4-1', number: '4.1', type: 'drill',
          title: 'The "So What?" Edit',
          brief: 'Audit your own copy line by line.',
          body: 'Pick any piece of copy you wrote in the last week. Read each line aloud. After each one, say "so what?" If the next line doesn\'t answer that, cut it or rewrite it.',
          drill: {
            technique: 'Most copy fails not at the writing but at the editing. This is the editing pass.',
            prompt: 'Open any piece of copy you wrote in the last 7 days.\nGo line by line.\nAfter each line, ask "so what?" out loud.\nIf the next line doesn\'t answer that question, kill it or rewrite it so it does.\nReport: how many lines died? Paste the new version vs the old.',
          },
          minutes: 15, xp: 80, archetype: 'creator',
        },
        {
          id: 'hb-4-2', number: '4.2', type: 'drill',
          title: 'Cold Email — Reader Stakes Pass',
          brief: 'Write a cold email where every line earns its keep.',
          body: 'Write a 90-word cold email applying the "so what?" test to every line before you send it. Subject + 4-5 sentences. Anyone reading should feel YOU\'RE writing to THEM.',
          drill: {
            technique: 'Reader stakes ≠ features. The reader is in EVERY line. They\'re the protagonist.',
            prompt: 'Write a 90-word cold email to a real or imagined recipient. Subject + body.\n\nRules:\n- The recipient is in every sentence (their problem, their gain, their reaction)\n- Apply "so what?" to every line\n- Halbert voice: contractions, short sentences, no dead phrases',
          },
          minutes: 20, xp: 110, archetype: 'creator',
        },
      ],
    },
  ],
};

/* ──────────────────────────────────────────────────────────────
   MEYER — FICTION COURSE
   ────────────────────────────────────────────────────────────── */

export const MEYER_COURSE: Course = {
  id: 'meyer',
  domain: 'fiction',
  name: 'Meyer: The Fiction Course',
  byline: 'Stephenie Meyer · Interiority + body-first',
  intro: '4 modules. 18 challenges. Each one trains one of Meyer\'s signature moves.',
  emoji: '🩸',
  sets: [
    {
      id: 'interiority',
      number: 1,
      emoji: '🧠',
      title: 'Interiority Dominance',
      hook: 'Every external action paired with an internal response.',
      challenges: [
        {
          id: 'me-1-1', number: '1.1', type: 'read',
          title: 'Read: What Meyer actually does',
          brief: 'The bootcamp note + 5 reference passages.',
          body: 'Read the Meyer bootcamp. Pay special attention to the 5 verbatim passages — that\'s the ceiling.',
          notePath: '01-CRAFT/writing/authors/stephenie-meyer.md',
          minutes: 7, xp: 15, archetype: 'maestro',
        },
        {
          id: 'me-1-2', number: '1.2', type: 'drill',
          title: 'The Interiority Pair × 6',
          brief: '6 sentences. 3 action-reaction pairs.',
          body: 'Write 6 sentences as 3 pairs. Each pair: external action followed immediately by internal response, located in the body.',
          drill: {
            technique: 'External THEN internal. Same sentence or back-to-back. Internal must be physical, not conceptual.',
            prompt: 'Write 6 sentences as 3 pairs. Each pair: action → response.\n\nExample of the move:\n"She closed the door. The latch click hit my chest harder than the words she\'d left on the other side."\n\nYour 3 pairs:',
          },
          minutes: 10, xp: 70, archetype: 'maestro',
        },
        {
          id: 'me-1-3', number: '1.3', type: 'chat',
          title: 'Meyer grades your pairs',
          brief: 'Send the 3 pairs. Get scored on the Interiority Pairing dimension.',
          body: 'Paste your 6 sentences. Meyer scores you on the Interiority Pairing dimension /10 with evidence + one specific revision instruction.',
          personaKey: 'meyer',
          minutes: 5, xp: 30, archetype: 'maestro',
        },
      ],
    },
    {
      id: 'body-first',
      number: 2,
      emoji: '🩸',
      title: 'Body-First Emotion',
      hook: "Emotions land in physical sensations, never abstractions.",
      challenges: [
        {
          id: 'me-2-1', number: '2.1', type: 'drill',
          title: 'The Body Sentence',
          brief: 'Convey one emotion using only physical sensation. No naming.',
          body: 'Pick an emotion. Write a 3-5 sentence passage that conveys it through physical sensation alone. Never name the emotion.',
          drill: {
            technique: 'Specific physical anchor. Avoid generic "tight chest" / "racing heart" clichés.',
            prompt: 'Pick one emotion: grief / rage / longing / shame / awe.\n\nWrite 3-5 sentences that convey it without naming it.\n\nGood Meyer example to study:\n"My hand stayed where it was. The pulse inside the wood was easier to feel than mine."\n\n(Don\'t copy that. Find your own physical anchor.)',
          },
          minutes: 12, xp: 80, archetype: 'maestro',
        },
        {
          id: 'me-2-2', number: '2.2', type: 'drill',
          title: 'Compressed Metaphor',
          brief: 'Five "X of Y" metaphors. No similes.',
          body: 'Write 5 compressed metaphors in "the X of Y" form. No "like" or "as." Each metaphor must do real work.',
          drill: {
            technique: 'Compressed metaphor: "the X of Y" structure (e.g. "the palmful of splintered pulp", "the geometry of his stillness").',
            prompt: 'Write 5 metaphors in "the X of Y" form. NO similes.\n\nSubjects to choose from (pick any):\n- a sleepless night\n- a parent\'s disappointment\n- a falling-out with a friend\n- the moment before a confession\n- a city at 3am',
          },
          minutes: 10, xp: 60, archetype: 'maestro',
        },
      ],
    },
    {
      id: 'restraint',
      number: 3,
      emoji: '⛓',
      title: 'Restraint-Impulse Rhythm',
      hook: 'Sensation → italicized self-command → physical failure.',
      challenges: [
        {
          id: 'me-3-1', number: '3.1', type: 'drill',
          title: 'The Restraint Pattern × 3',
          brief: 'Three full passages of the move.',
          body: 'Write 3 short passages (4-6 sentences each). Each one: a physical sensation, then the narrator tries to override it (italicized self-command), then the body fails to obey.',
          drill: {
            technique: 'Italicize the override. Then show the body losing.',
            prompt: '3 passages. Each follows the pattern:\n1. Physical sensation (3-4 lines)\n2. Italicized self-command (1 line)\n3. Body fails (1 line)\n\nUse different sensations / scenarios for each. Pure Meyer rhythm.',
          },
          minutes: 18, xp: 110, archetype: 'maestro',
        },
      ],
    },
    {
      id: 'sentence',
      number: 4,
      emoji: '✦',
      title: 'The Triple-Beat Sentence',
      hook: 'Setup → conclusion → 3-word stab. The Meyer cadence.',
      challenges: [
        {
          id: 'me-4-1', number: '4.1', type: 'drill',
          title: 'The Triple Beat × 5',
          brief: 'Five sentences, each ending in a 3-word stab.',
          body: 'Write 5 sentences, each in setup → conclusion → 3-word stab form. The stab should hit harder than the body of the sentence.',
          drill: {
            technique: 'The third beat carries the weight. Keep it short and unforgiving.',
            prompt: 'Five sentences. Each must end with a 3-word stab.\n\nExample of the move:\n"She turned to leave; the wind caught the door; it slammed."\n\nYour 5:',
          },
          minutes: 10, xp: 70, archetype: 'maestro',
        },
        {
          id: 'me-4-2', number: '4.2', type: 'monologue',
          title: 'Voice Practice: as Bella · 60 sec',
          brief: 'Generate + practice a monologue in a Meyer character\'s voice.',
          body: 'Open the Monologue generator. Pick a context (the breakup, the secret kept, the impossible choice) and "as Bella" or "as Edward." Generate. Practice it aloud.',
          minutes: 12, xp: 70, archetype: 'maestro',
        },
      ],
    },
  ],
};

/* ──────────────────────────────────────────────────────────────
   SPEECH COURSE
   ────────────────────────────────────────────────────────────── */

export const SPEECH_COURSE: Course = {
  id: 'speech',
  domain: 'speech',
  name: 'The Articulacy Course',
  byline: 'The 7 Rules + the 3 Problems',
  intro: '3 modules. 12 challenges. Diagnose the failure mode → drill the fix.',
  emoji: '🎙️',
  sets: [
    {
      id: 'diagnose',
      number: 1,
      emoji: '🔍',
      title: 'Diagnose',
      hook: 'You can\'t fix what you can\'t see.',
      challenges: [
        {
          id: 'sp-1-1', number: '1.1', type: 'read',
          title: 'Read: The 7 Rules',
          brief: 'The framework. 6 min.',
          body: 'Read the 7 Rules of Articulacy. Pay attention to which one you violate most.',
          notePath: '01-CRAFT/speech-training.md',
          minutes: 6, xp: 15, archetype: 'leader',
        },
        {
          id: 'sp-1-2', number: '1.2', type: 'chat',
          title: 'Coach diagnoses you',
          brief: 'Talk to the coach. Get told WHICH of the 3 problems is yours.',
          body: 'Open the coach chat. Tell them your speaking context, your frustration, or paste a recent example. They identify your dominant failure mode.',
          personaKey: 'speech-coach',
          minutes: 10, xp: 50, archetype: 'leader',
        },
      ],
    },
    {
      id: 'drill',
      number: 2,
      emoji: '🔨',
      title: 'Drill the Fix',
      hook: 'One drill at a time. Specific instrument trained.',
      challenges: [
        {
          id: 'sp-2-1', number: '2.1', type: 'drill',
          title: 'Tongue twisters × 3',
          brief: 'Articulation warm-up.',
          body: 'Three tongue twisters, 3× each, slow then fast.',
          drill: {
            technique: 'Over-articulate. Feel where your tongue lands.',
            prompt: '— Red leather, yellow leather.\n— She sells seashells by the seashore.\n— The sixth sick sheikh\'s sixth sheep\'s sick.\n\nEach line, 3× slow then 3× at speed.',
          },
          minutes: 4, xp: 30, archetype: 'leader',
        },
        {
          id: 'sp-2-2', number: '2.2', type: 'drill',
          title: 'One Idea, 60 Seconds',
          brief: 'Force depth instead of breadth.',
          body: 'Pick ONE idea. Speak about ONLY that idea for 60 seconds.',
          drill: {
            technique: 'When you run out, repeat-and-extend. Don\'t dodge to a related idea.',
            prompt: 'Pick one idea (any: "trust," "Sundays," "first jobs").\nSpeak about ONLY that for 60 seconds.\nIf you run out before time, repeat and extend the same thought.\nDo NOT change topics.',
          },
          minutes: 3, xp: 40, archetype: 'leader',
        },
        {
          id: 'sp-2-3', number: '2.3', type: 'drill',
          title: 'The 3×5 Daily Diet',
          brief: '15 min: read above level · poetry aloud · listen + visualize.',
          body: 'Three 5-minute sessions: read above your level, read poetry aloud, listen + visualize words.',
          drill: {
            technique: 'Daily inputs are the long game. Eloquence is downstream of input quality.',
            prompt: '15 min total. 3 phases:\n\n1. (5 min) Read article or book chapter ONE LEVEL above your current input.\n2. (5 min) Read poetry aloud. Focus on rhythm + cadence (not meaning).\n3. (5 min) Listen to podcast/audiobook but IGNORE THE CONTENT. Visualize the words.',
          },
          minutes: 15, xp: 80, archetype: 'leader',
        },
      ],
    },
    {
      id: 'perform',
      number: 3,
      emoji: '🎭',
      title: 'Perform',
      hook: 'Apply it in scene.',
      challenges: [
        {
          id: 'sp-3-1', number: '3.1', type: 'monologue',
          title: 'Closing-the-sale monologue',
          brief: 'AI writes it · you perform it.',
          body: 'Open the Monologue generator. Pick "Closing the sale" and your own voice. Generate. Perform out loud with the timer.',
          minutes: 8, xp: 60, archetype: 'leader',
        },
        {
          id: 'sp-3-2', number: '3.2', type: 'monologue',
          title: 'Hard conversation monologue',
          brief: 'Rehearse a real one before you have it.',
          body: 'Type the actual hard conversation you need to have this week as the context. Generate the monologue. Practice it.',
          minutes: 10, xp: 80, archetype: 'leader',
        },
      ],
    },
  ],
};

export const COURSES: Course[] = [HALBERT_COURSE, MEYER_COURSE, SPEECH_COURSE];

export function getCourse(id: string): Course | undefined {
  return COURSES.find(c => c.id === id);
}
export function getCourseByDomain(domain: Domain): Course | undefined {
  return COURSES.find(c => c.domain === domain);
}
export function getChallenge(courseId: string, challengeId: string): { course: Course; set: ChallengeSet; challenge: Challenge } | null {
  const course = getCourse(courseId);
  if (!course) return null;
  for (const set of course.sets) {
    for (const ch of set.challenges) {
      if (ch.id === challengeId) return { course, set, challenge: ch };
    }
  }
  return null;
}

export const DOMAIN_LABELS: Record<Domain, { name: string; emoji: string; tagline: string }> = {
  copy:    { name: 'Copy',    emoji: '✉️', tagline: 'Halbert school · headlines + offers + cold email' },
  fiction: { name: 'Fiction', emoji: '🩸', tagline: 'Meyer school · interiority + body-first + restraint' },
  speech:  { name: 'Speech',  emoji: '🎙️', tagline: 'The 7 Rules of Articulacy · practice + perform' },
};
