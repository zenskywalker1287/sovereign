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
    return Object.keys(this.store).filter(p => p.startsWith(prefix));
  }
  async read(path: string): Promise<string> {
    if (!(path in this.store)) throw new Error(`Not found: ${path}`);
    return this.store[path];
  }
  async write(path: string, content: string): Promise<void> {
    this.store[path] = content;
    persist(this.store);
  }
  async exists(path: string): Promise<boolean> {
    return path in this.store;
  }
}
