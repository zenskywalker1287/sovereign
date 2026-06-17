import type { VaultAdapter } from './adapter';

/**
 * Web/dev adapter. Backed by an in-memory sample vault that mirrors
 * the SOVEREIGN folder layout. Writes persist to localStorage so the
 * Writing Studio can save graded files across dev sessions.
 *
 * In a future step we can wire File System Access API for desktop
 * Chromium, but in-memory is enough to build + iterate on UX.
 */
const SAMPLE: Record<string, string> = {
  '01-CRAFT/writing/_INDEX.md': `# Writing Bootcamp\n\nFiction (Stephenie Meyer) + copywriting (Gary Halbert).`,
  '01-CRAFT/writing/graded/.gitkeep': '',
};
const LS_KEY = 'sovereign.vault.web.v1';

// Files we ship statically in /public/sample-vault — used for read-only fallback
// so the note reader works in the browser even before the user has a real vault wired.
const STATIC_SAMPLE_PATHS = new Set([
  '_OBSIDIAN-DASHBOARD.md',
  '_OBSIDIAN-SETUP.md',
  '_TAGS.md',
  '01-CRAFT/speech-training.md',
  '01-CRAFT/writing/authors/gary-halbert.md',
  '01-CRAFT/writing/authors/stephenie-meyer.md',
]);

async function fetchStatic(path: string): Promise<string | null> {
  if (!STATIC_SAMPLE_PATHS.has(path)) return null;
  try {
    const url = `${import.meta.env.BASE_URL}sample-vault/${path}`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    return await resp.text();
  } catch { return null; }
}

function loadFromLocalStorage(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}
function persist(store: Record<string, string>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(store)); } catch {}
}

export class WebAdapter implements VaultAdapter {
  private store: Record<string, string>;
  constructor() {
    this.store = { ...SAMPLE, ...loadFromLocalStorage() };
  }
  async list(folder: string): Promise<string[]> {
    const prefix = folder.endsWith('/') ? folder : folder + '/';
    const local = Object.keys(this.store).filter(p => p.startsWith(prefix));
    const staticOnes = [...STATIC_SAMPLE_PATHS].filter(p => p.startsWith(prefix));
    return [...new Set([...local, ...staticOnes])].sort();
  }
  async read(path: string): Promise<string> {
    if (path in this.store) return this.store[path];
    const staticContent = await fetchStatic(path);
    if (staticContent !== null) return staticContent;
    throw new Error(`Not found: ${path}`);
  }
  async write(path: string, content: string): Promise<void> {
    this.store[path] = content;
    persist(this.store);
  }
  async exists(path: string): Promise<boolean> {
    if (path in this.store) return true;
    if (STATIC_SAMPLE_PATHS.has(path)) return (await fetchStatic(path)) !== null;
    return false;
  }
}
