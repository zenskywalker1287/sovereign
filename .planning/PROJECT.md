# SOVEREIGN

**Personal OS / second brain.** A gamified daily-loop iPhone-installable PWA that pairs an RPG-style identity layer (aura, missions, archetypes, XP) with a writing studio that grades fiction + copywriting drills against signature author rubrics (Stephenie Meyer for fiction, Gary Halbert for copy) using LLMs.

## Owner
Zatreides (Skywalker) — solo personal use.

## Hard constraints
- **Vault is the database.** Obsidian markdown files in iCloud are the source of truth long-term. v1 uses localStorage adapter; vault adapter abstraction stays clean so the swap is a runtime config later.
- **No backend.** Pure static SPA on GitHub Pages. Anything fancier waits.
- **Lean on disk.** Mac currently 2.6 GB free. No Xcode-class operations. PWA path only until disk recovers.
- **Pure B&W / iOS 18 system aesthetic.** No mascot art, no accent colors beyond system tint.

## Tech
- Vite + React 19 + TypeScript
- TanStack Router (file-based) + TanStack Query + Zustand (persist)
- Tailwind v4 + iOS design tokens (light + dark, auto)
- Capacitor (config in repo, iOS target deferred)
- LLM grading: OpenRouter (Llama 3.3 70B free default) with Gemini fallback
- Service worker for offline shell
- Deploy: GitHub Pages via Actions on `main` push → https://zenskywalker1287.github.io/sovereign/

## What "done" looks like for v1
The user opens SOVEREIGN on their iPhone home screen, enters their passcode, picks a Halbert drill, writes for 15 minutes, hits Submit, sees a 92/100 score with one revision instruction, and their stats + XP + streak update and *stay updated* the next day.
