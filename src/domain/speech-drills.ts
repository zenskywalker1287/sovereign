/**
 * Speech Gym drill catalog. Each drill trains one instrument of articulate
 * speech, sourced from the vault's `01-CRAFT/speech-training.md` (7 Rules
 * of Articulacy + 3x5 Language Diet + Practical Drills).
 *
 * v1: timer + prompt + technique focus + "mark complete" → awards XP to
 * the Leader archetype + bumps streak. Audio recording lands in v2.
 */
export type SpeechSkill =
  | 'articulation'    // mouth, lips, tongue precision
  | 'pace'            // breath, pause, deliberate tempo
  | 'vocabulary'      // surface→deep lexicon expansion
  | 'thought-grip'    // sustained attention on one idea
  | 'cadence'         // rhythm, eloquent sentence shapes
  | 'humility'        // intellectual humility / "give me a moment"
  | 'diet';           // 3x5 daily inputs

export interface SpeechDrill {
  id: string;
  title: string;
  skill: SpeechSkill;
  minutes: number;
  technique: string;       // what to focus on
  prompt: string;          // what to do
  source?: string;         // vault reference
}

export const SPEECH_DRILLS: SpeechDrill[] = [
  // ── ARTICULATION ──
  {
    id: 'art-tongue-twister', title: 'Tongue-Twister Set', skill: 'articulation', minutes: 3,
    technique: 'Move slow. Over-articulate. Feel where your tongue and lips actually land.',
    prompt: 'Say each line out loud, 3x, slowly first then at speed:\n\n— Red leather, yellow leather.\n— She sells seashells by the seashore.\n— Unique New York. Unique New York.\n— The sixth sick sheikh\'s sixth sheep\'s sick.\n— Peggy Babcock Peggy Babcock Peggy Babcock.',
  },
  {
    id: 'art-mirror-mouth', title: 'Mirror Mouth Drill', skill: 'articulation', minutes: 5,
    technique: 'Watch your mouth in the mirror. Exaggerate every shape.',
    prompt: 'Pick any paragraph (news article, vault note). Read it aloud while watching your mouth in a mirror. Force each consonant. Slow down 30% from natural pace.',
  },

  // ── PACE / BREATH ──
  {
    id: 'pace-pause-3', title: 'Three-Second Pause', skill: 'pace', minutes: 4,
    technique: 'Pause before EVERY sentence. Count "one-two-three" mentally.',
    prompt: 'Pick a topic you know cold. Speak about it for 3 minutes. Before every new sentence, pause for 3 seconds. Resist filling the silence. The pause is the lesson.',
  },
  {
    id: 'pace-breath', title: 'Diaphragm Breath', skill: 'pace', minutes: 5,
    technique: 'Inhale low into the belly, not the chest. Exhale slow on a count.',
    prompt: 'Hand on stomach. 5 reps:\n1. Inhale 4 seconds (belly out)\n2. Hold 4 seconds\n3. Exhale 8 seconds (belly in)\n\nThen read a paragraph aloud using the new breath baseline.',
  },
  {
    id: 'pace-paragraph-tempo', title: 'Tempo Lock', skill: 'pace', minutes: 5,
    technique: 'Same paragraph, three speeds. Notice how meaning shifts with tempo.',
    prompt: 'Pick a 100-word paragraph. Read it 3 times:\n1. In exactly 30 seconds (fast)\n2. In exactly 45 seconds (normal)\n3. In exactly 60 seconds (slow + weighted)\n\nWhich tempo makes you sound most certain?',
  },

  // ── VOCABULARY ──
  {
    id: 'vocab-dead-phrase', title: 'Dead Phrase Audit', skill: 'vocabulary', minutes: 10,
    technique: 'You can\'t fix what you can\'t see. Find your defaults.',
    prompt: 'Record yourself speaking on any topic for 2 minutes (Voice Memos). Transcribe it. Highlight every dead phrase: "at the end of the day," "to be honest," "kind of like," "literally," "secret sauce." Rewrite the whole thing eliminating every one.',
    source: '01-CRAFT/speech-training',
  },
  {
    id: 'vocab-word-replace', title: 'Word Replacement', skill: 'vocabulary', minutes: 5,
    technique: 'One word per sentence. Just one. Make it surprising and precise.',
    prompt: 'Write 5 sentences you\'d say in normal conversation. For each one, find the most "default" word and replace it with something more precise. Underline the replacement. Read both versions aloud.',
    source: '01-CRAFT/speech-training',
  },

  // ── THOUGHT GRIP ──
  {
    id: 'grip-60-second', title: 'One Idea, 60 Seconds', skill: 'thought-grip', minutes: 3,
    technique: 'Force depth instead of breadth. Stay on the idea.',
    prompt: 'Pick ONE idea (any: "trust," "rhythm," "Sundays"). Speak about ONLY that idea for 60 seconds without changing topics. If you run out, repeat-and-extend. Don\'t dodge to a related idea.',
    source: '01-CRAFT/speech-training',
  },
  {
    id: 'grip-repeat-question', title: 'Repeat the Question', skill: 'thought-grip', minutes: 5,
    technique: 'Repeating the topic aloud warms up the conscious mind before you answer.',
    prompt: 'Have someone ask you 5 random questions (or use ChatGPT). Before answering each one, say the question back in your own words, then pause 2 seconds, THEN answer. Notice the answers get sharper.',
  },

  // ── CADENCE ──
  {
    id: 'cadence-poetry', title: 'Poetry Reading', skill: 'cadence', minutes: 5,
    technique: 'You\'re not reading the meaning. You\'re training your mouth to feel eloquent shapes.',
    prompt: 'Read one poem out loud, slowly. Suggested: Mary Oliver "Wild Geese" · Whitman "Song of Myself §1" · Rilke "Du im Voraus." Feel each line break as a deliberate breath.',
    source: '01-CRAFT/speech-training',
  },
  {
    id: 'cadence-jagged', title: 'Jagged Sentences', skill: 'cadence', minutes: 5,
    technique: 'Alternate sentence lengths. Short-long-short-stab. Rhythm is half the game.',
    prompt: 'Speak a 90-second monologue on any topic, BUT alternate sentence lengths deliberately:\nshort. then long with three clauses that build, building. short. one bigger sweep. stab.',
  },

  // ── HUMILITY ──
  {
    id: 'humility-give-me', title: '"Give Me a Moment"', skill: 'humility', minutes: 3,
    technique: 'Owning the pause sounds more confident than filling it.',
    prompt: 'Rehearse 5 versions of admitting you need to think:\n— "Give me a moment to process that."\n— "I\'d have to sit with that one."\n— "Let me actually think about that — I haven\'t before."\n— "Honest answer: I don\'t know. Here\'s what I\'d need to know first…"\n— "I can give you a fast answer or a real one — which do you want?"\n\nSay each one out loud as if you mean it.',
    source: '01-CRAFT/speech-training',
  },

  // ── 3x5 LANGUAGE DIET ──
  {
    id: 'diet-3x5', title: '3×5 Language Diet', skill: 'diet', minutes: 15,
    technique: 'Daily inputs are the long game. Eloquence is downstream of input quality.',
    prompt: '15 minutes total, 3 sessions of 5 minutes each:\n\n1. **5 min** — Read an article or book chapter ONE LEVEL above your current input. Aloud or silent.\n2. **5 min** — Read poetry aloud, focusing on rhythm + cadence (not meaning).\n3. **5 min** — Listen to a podcast or audiobook but IGNORE THE CONTENT. Just visualize the words. Train the gap between *intelligence* and *eloquence*.',
    source: '01-CRAFT/speech-training',
  },
];

export function speechDrillsBySkill(skill: SpeechSkill): SpeechDrill[] {
  return SPEECH_DRILLS.filter(d => d.skill === skill);
}
export function speechDrillById(id: string): SpeechDrill | undefined {
  return SPEECH_DRILLS.find(d => d.id === id);
}

export const SKILL_LABELS: Record<SpeechSkill, string> = {
  articulation:  'Articulation',
  pace:          'Pace + Breath',
  vocabulary:    'Vocabulary',
  'thought-grip':'Thought Grip',
  cadence:       'Cadence',
  humility:      'Humility',
  diet:          'Daily Diet',
};
