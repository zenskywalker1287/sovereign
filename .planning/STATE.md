# SOVEREIGN — STATE

**Phase:** P0–P2 all shipped, plus a large body of unplanned work (see below).
Next real phase is P3, which is blocked.
**HEAD:** `main` @ `0940279` — *tabs renamed + college-course structure for COPY/FICTION/SPEECH*
**Live:** https://zenskywalker1287.github.io/sovereign/
**Master context:** `.planning/GILGAMESH-CONTEXT.md` — read that first.

> Corrected 2026-09-01. The previous version of this file claimed "P1 in progress"
> and was many commits behind reality.

## Shipped
- **P0** — 5-tab shell, iOS 18 tokens, Writing Studio MVP, 14 drills, grading engine,
  settings sheet, PWA + service worker, GH Pages deploy.
- **P1** — passcode gate (`src/auth/`), persistent Zustand store (`src/domain/store.ts`),
  every tab wired to live data, XP engine, graded history, wipe-all-data.
- **P2** — Mental Diet, Watch, Surprise Me, Journal, Note Reader.
- **Beyond the roadmap** — Speech Gym (5 routes; roadmap still lists it as parked),
  custom daily/weekly/monthly tasks with XP routing, AI coach personas
  (Halbert / Meyer / Speech Coach), monologue + drill generators, appearance/theme
  system, notifications, bookmarks toolkit, universal transcriber, courses structure.

## Tabs — current, not what the roadmap says
**To Do · Ascension · Mind · Library · Me.** `/brain` is a legacy URL kept for deep
links; its label is *Ascension*.

## Open decisions (unchanged)
- Aesthetic: iOS 18 native, pure B&W ✅
- Stack: Capacitor + Vite + React + TS ✅
- Deploy: GH Pages (Vercel deferred, Xcode/TestFlight deferred) ✅
- Provider: OpenRouter default · Llama 3.3 70B free · Gemini fallback ✅
- Vault: localStorage WebAdapter for v1 · iCloud move deferred ✅

## Active blockers
- **P3 vault sync** — needs the SOVEREIGN/ folder moved out of Obsidian's iCloud
  container into standard iCloud Drive. `CapacitorAdapter` is written and lazy-loaded
  in `src/vault/adapter.ts`, but nothing exercises it.
- **P4 native iOS** — disk. Was 2.6 GB free on the Mac; Xcode needs far more.

## Resume cue
The old cue pointed at `/Users/Skywalker/Downloads/01_ACTIVE_HUSTLE/sovereign` on the
Mac — unreachable from any cloud session. If uncommitted work is sitting there, it
still has to be pushed by hand. From a cloud session, clone the repo and start at
`.planning/GILGAMESH-CONTEXT.md`.
