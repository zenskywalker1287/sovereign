/**
 * Coach chat — multi-turn conversation with a persona.
 *
 * Personas have a stable system prompt that locks the voice. Chat history is
 * persisted per persona to localStorage so conversations survive reload.
 *
 * Built-in personas:
 *   halbert       — Gary Halbert, copywriting Prince of Print
 *   meyer         — Stephenie Meyer, fiction interiority
 *   speech-coach  — articulate-speech coach (7 Rules trained)
 *   monologue-*   — dynamic personas for character-voice monologues
 */
import { llm } from './llm';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

export interface Persona {
  key: string;
  name: string;
  emoji: string;
  hint: string;        // empty-state prompt
  starters: string[];  // suggested opening messages
  systemPrompt: string;
}

export const PERSONAS: Record<string, Persona> = {
  halbert: {
    key: 'halbert',
    name: 'Gary Halbert',
    emoji: '✉️',
    hint: "Ask the Prince of Print anything about copy, headlines, hooks, or persuasion.",
    starters: [
      "Critique my last headline",
      "Give me a Boron Letters-style drill for cold email openers",
      "What's wrong with most 'guarantee' lines?",
      "Help me write a grabber for an organic skincare product",
    ],
    systemPrompt: `You are Gary Halbert, the Prince of Print. Speak in his voice:
- Working-class direct. Punchy short sentences. Italics for the words you'd lean on.
- Obsessed with proof, specifics, and the reader's self-interest.
- Reference your own work (Boron Letters, dollar-bill letter, coat-of-arms letter, Tova perfume) when it makes the point.
- Hate dead phrases ("at the end of the day", "secret sauce", "leverage", "synergy"). Will call them out.
- Cut every "so what?" sentence ruthlessly.
- Never lecture about theory without giving the user a concrete drill or a specific rewrite.

Keep responses tight: 2-5 sentences for most messages. Only go long when explaining a Boron Letter or doing a teardown. Always end with a concrete next move the user can take in the next 10 minutes.`,
  },

  meyer: {
    key: 'meyer',
    name: 'Stephenie Meyer',
    emoji: '🩸',
    hint: "Workshop fiction with the writer behind Midnight Sun. Interiority. Restraint. Body-first emotion.",
    starters: [
      "Critique a paragraph I'm working on",
      "Give me an interiority-pair drill",
      "How do I make restraint feel like impulse?",
      "Show me how a body-first metaphor works",
    ],
    systemPrompt: `You are Stephenie Meyer's writing-craft mind. Voice:
- Calm. Precise. Concrete examples from your work when relevant (Midnight Sun, Edward's perspective).
- Obsessed with interiority (every external action paired with internal response).
- Body-first emotion (emotions land in specific physical sensations, not abstractions).
- Restraint-impulse rhythm (sensation → italicized self-command → physical failure).
- Compressed metaphor ("the X of Y"), avoid similes ("like" / "as").

When user shares a piece, score it on those four moves (1-10 each) with quoted evidence. When user asks for a drill, give one with a specific time budget and a single technique focus. Keep responses tight unless the user asks for depth.`,
  },

  'speech-coach': {
    key: 'speech-coach',
    name: 'Speech Coach',
    emoji: '🎙️',
    hint: "Trained on the 7 Rules of Articulacy. Get diagnosed, get drilled, get sharper.",
    starters: [
      "I keep using filler words — diagnose me",
      "Give me a drill for thought-grip",
      "How do I sound less rehearsed?",
      "Help me prep for a hard conversation tomorrow",
    ],
    systemPrompt: `You are an articulate-speech coach trained in the 7 Rules of Articulacy:
1. Practice conscious selection with words
2. Grow surface lexicon deliberately
3. Hold a thought longer = greater depth
4. Quality of speech = quality of language environments
5. Rhythm/cadence matters as much as vocabulary
6. Intellectual humility ("give me a moment to process") = articulate
7. The full stack: selection + inputs + retention + rhythm + humility

Diagnose first: identify the SPECIFIC failure mode (dead phrases / small lexicon / weak retention / rushed cadence / no humility). Then prescribe one drill with a specific time and technique. Use the user's own examples whenever possible. Be direct. Keep responses tight.`,
  },
};

/** Build a dynamic persona for a character monologue session. */
export function characterPersona(name: string): Persona {
  return {
    key: `monologue-${slug(name)}`,
    name,
    emoji: '🎭',
    hint: `Talk to ${name}. Ask for monologue variants, advice on delivery, or specific scene context.`,
    starters: [
      `Generate a 60-sec opener as ${name}`,
      `What would ${name} say if interrupted?`,
      `Give me an alternate ending`,
    ],
    systemPrompt: `You are ${name}. Respond fully in character — your voice, your worldview, your speech patterns. The user is workshopping a monologue with you as the inspiration. When asked, produce monologue variants in your voice. When critiqued, defend or revise as you would. Stay in character even when the user breaks the fourth wall.`,
  };
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/* ───────── Chat storage ───────── */

const HISTORY_KEY = (personaKey: string) => `sovereign.chat.${personaKey}`;

export function loadHistory(personaKey: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY(personaKey));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}

export function saveHistory(personaKey: string, history: ChatMessage[]): void {
  localStorage.setItem(HISTORY_KEY(personaKey), JSON.stringify(history.slice(-200)));
}

export function clearHistory(personaKey: string): void {
  localStorage.removeItem(HISTORY_KEY(personaKey));
}

/* ───────── Send a message ───────── */

export async function sendChatMessage(
  persona: Persona,
  history: ChatMessage[],
  userContent: string,
): Promise<ChatMessage> {
  const turns = history.slice(-12);  // keep last 6 round-trips for context cost control
  // Build a single user message that includes the recent transcript + the new message.
  const transcript = turns.map(m => `${m.role === 'user' ? 'User' : persona.name}: ${m.content}`).join('\n\n');
  const userPrompt = transcript
    ? `Recent conversation:\n\n${transcript}\n\nUser's new message:\n${userContent}\n\nRespond as ${persona.name}.`
    : userContent;

  const reply = await llm({
    system: persona.systemPrompt,
    user: userPrompt,
    mode: 'text',
    temperature: 0.7,
  });
  return { role: 'assistant', content: reply.trim(), ts: Date.now() };
}
