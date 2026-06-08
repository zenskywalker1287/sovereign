/**
 * Watch flow — give it a YouTube URL, get a structured note back.
 * Forces Gemini (only provider with reliable YouTube video understanding on free tier).
 */
import { llm, parseJsonLoose, MissingKeyError } from './llm';
import { getVault } from '@/vault/adapter';

export interface WatchNote {
  url: string;
  title: string;
  oneLineSummary: string;
  keyTakeaways: string[];      // 3-7 bullets
  bestMoments: { timestamp?: string; note: string }[];
  applyTo: string;             // how this connects to the user's work
  savedPath?: string;
}

function isYouTube(url: string): boolean {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url);
}

const PROMPT = (url: string) => `Watch this video and produce a structured note for the user (a copywriter/agency owner).

VIDEO: ${url}

Return ONLY this JSON, no prose:
{
  "title": "the video's title",
  "oneLineSummary": "one sentence — what is this video about?",
  "keyTakeaways": ["3-7 specific lessons, each one a complete sentence with substance"],
  "bestMoments": [{"timestamp": "0:00-0:00", "note": "what happens here"}, ...3-5 entries],
  "applyTo": "one paragraph: how this could apply to copywriting/agency work specifically"
}`;

export async function watchAndSummarize(url: string): Promise<WatchNote> {
  if (!isYouTube(url)) throw new Error('Only YouTube URLs work right now (Gemini limitation).');

  // Force Gemini — OpenRouter doesn't reliably do YouTube video input on free tier.
  let text: string;
  try {
    text = await llm({
      user: PROMPT(url),
      mode: 'json',
      temperature: 0.5,
      fileUri: url,
      modelOverride: { provider: 'gemini', modelId: 'gemini-flash-latest' },
    });
  } catch (e) {
    if (e instanceof MissingKeyError) {
      throw new Error('Watch needs a Gemini key. Add one in Profile → Settings → Gemini API Key.');
    }
    throw e;
  }

  const json = parseJsonLoose(text);
  const note: WatchNote = {
    url,
    title:           String(json.title ?? 'Untitled'),
    oneLineSummary:  String(json.oneLineSummary ?? ''),
    keyTakeaways:    (json.keyTakeaways ?? []).slice(0, 7).map(String),
    bestMoments:     (json.bestMoments ?? []).slice(0, 5).map((m: any) => ({
                       timestamp: m.timestamp ? String(m.timestamp) : undefined,
                       note: String(m.note ?? ''),
                     })),
    applyTo:         String(json.applyTo ?? ''),
  };

  // Save to vault for later browsing
  const slug = (note.title || 'video').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60);
  const date = new Date().toISOString().slice(0, 10);
  const path = `08-LIBRARY/watched/${date}_${slug}.md`;
  const md = renderWatchMarkdown(note, date);
  const vault = await getVault();
  await vault.write(path, md);
  note.savedPath = path;
  return note;
}

function renderWatchMarkdown(n: WatchNote, date: string): string {
  return `---
title: ${n.title}
url: ${n.url}
watched: ${date}
tags: [watched, library]
---

# ${n.title}

**Summary:** ${n.oneLineSummary}

## Key Takeaways
${n.keyTakeaways.map(t => `- ${t}`).join('\n')}

## Best Moments
${n.bestMoments.map(m => `- ${m.timestamp ? `**[${m.timestamp}]** ` : ''}${m.note}`).join('\n')}

## Apply To
${n.applyTo}

---
[Open on YouTube](${n.url})
`;
}
