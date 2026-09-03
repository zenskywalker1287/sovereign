# GILGAMESH — MASTER CONTEXT

*The home for the Gilgamesh thread after the original chat was lost. One index across
three connected bodies of work: the **app**, the **book**, and the **persona**.
Read this first; it points at every real source and says where the docs lie.*

**Owner:** Zen / Zatreides (Skywalker) — solo, personal.
**Rebuilt:** 2026-09-01, reconstructed from surviving artifacts, not from the lost chat.
**Canonical copy:** this file. A pointer stub lives at `zatreidescreatives/GILGAMESH-CONTEXT.md`.

---

## 0. What "Gilgamesh" means here

One aesthetic running through three projects. The **Gilsagi** frame — Gilgamesh
(Fate) fused with Isagi Yoichi (Blue Lock):

- **Gilgamesh** — King of Heroes. Absolute self-certainty, zero self-loathing.
  Everything weighed for *worth*. Treasury framing: all value is already his.
  Sentences land as **verdicts, not opinions**. Bored on a full throne until
  something worthy appears.
- **Isagi** — devouring ambition, ego-as-virtue. Hyper-analytical: reads the
  field in real time and weaponizes it. Reframes every weakness into a weapon.

Nietzsche's Übermensch, will-to-power, self-overcoming and eternal recurrence
*are* this worldview — which is why the same voice carries the app, the book and
the mindset work without being three different things.

---

## 1. THE APP — SOVEREIGN

Personal OS / second brain. A gamified daily-loop, iPhone-installable PWA pairing
an RPG identity layer (aura, missions, archetypes, XP) with a writing studio that
grades fiction + copy drills against signature-author rubrics via LLM.

**Repo:** `zenskywalker1287/sovereign` · **Live:** https://zenskywalker1287.github.io/sovereign/
**Charter + roadmap:** `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`

### Hard constraints (unchanged, still binding)
- **Vault is the database.** Obsidian markdown in iCloud is the long-term source
  of truth. v1 runs a localStorage adapter; the adapter abstraction stays clean
  so the swap is a runtime config later.
- **No backend.** Pure static SPA on GitHub Pages.
- **Lean on disk.** Mac was at 2.6 GB free. No Xcode-class operations.
- **Pure B&W / iOS 18 system aesthetic.** No mascot art, no accent colors beyond
  system tint.

### Stack
Vite + React 19 + TypeScript · TanStack Router (file-based) + TanStack Query +
Zustand (persist) · Tailwind v4 with iOS light/dark tokens · Capacitor (config in
repo, iOS target deferred) · LLM grading through OpenRouter (Llama 3.3 70B free
default) with Gemini fallback · service worker for offline shell · GH Pages deploy
via Actions on `main`.

### ⚠️ Where the old docs were wrong
`STATE.md` claimed "P1 in progress." That was stale by a wide margin. Actually
shipped since, verified against `main` @ `0940279`:

- **P1 complete** — passcode gate (`src/auth/`), persistent Zustand store
  (`src/domain/store.ts`), all tabs wired, XP engine, graded history
  (`routes/brain/history.tsx`), wipe-all-data in Settings.
- **P2 complete** — Mental Diet, Watch, Surprise Me, Journal, Note Reader
  (`note.$.tsx` / `folder.$.tsx`).
- **Shipped but never on the roadmap** — Speech Gym (five routes under
  `src/routes/speech/`, despite the roadmap still listing it *out of scope*),
  custom daily/weekly/monthly tasks with XP routing, AI coach personas
  (`src/domain/coach.ts`), monologue + drill generators, appearance/theme system,
  notifications, bookmarks toolkit, universal transcriber, and a college-course
  structure for COPY / FICTION / SPEECH.
- **Tabs renamed twice.** Roadmap says Home · Missions · Archetypes · Brain ·
  Profile. Reality is **To Do · Ascension · Mind · Library · Me**. The `/brain`
  URL is kept as a legacy deep link but is labeled *Ascension*.
- **Still genuinely blocked:** P3 vault sync (needs the iCloud container move) and
  P4 native iOS (needs disk for Xcode). `CapacitorAdapter` exists and is
  lazy-loaded, but the iOS target is not built.

### The 5 archetypes
Executor 執行者 · Warrior 戦士 · Creator 創造者 · Maestro 巨匠 · Leader 指導者.
Level curve `xpForLevel(n) = round(100 * n^1.6)` — Lvl 1 = 100, Lvl 10 = 3,981,
Lvl 47 ≈ 33,000. Drill submissions route XP to the archetype matched by lane/author.

### What "done" looks like for v1
Open SOVEREIGN from the iPhone home screen, enter the passcode, pick a Halbert
drill, write for 15 minutes, hit Submit, see 92/100 with one revision instruction,
and watch stats + XP + streak update — and *stay* updated the next day.

---

## 2. THE BOOK — Zarathustra in the Gilsagi voice

**Source doc:** `zatreidescreatives/BOOKS-HANDOFF.md` (Book 2 of two).

A tone-and-perspective rewrite of *Thus Spoke Zarathustra*. **The substance stays** —
the ideas are already on par. What changes is voice and point of view, so the
philosophy goes down easy and hits like motivation.

**Job of the book:** make Nietzsche devourable. Turn dense 19th-century
philosophical poetry into a first-person, high-ego, cinematic voice a hungry modern
reader eats in one sitting and feels *moved* by.

**Voice rules**
- Keep Zarathustra's ideas and arc intact. Change the *register*: royal decree
  plus tactical hunger.
- Verdict sentences (Gilgamesh) alternating with real-time analytical drive (Isagi).
- Zero self-pity. Everything assessed for worthiness. The reader is *elevated*,
  not lectured.
- Modern clarity over archaic syntax — that is the whole point — but keep the grandeur.

**Do:** make Nietzsche feel like a King handing you the blueprint to overcome
yourself. **Don't:** flatten it into gym-bro quotes. Keep the depth, just make it
reachable.

**Note:** these are books, not marketing copy. Em dashes, long sentences and
literary rhythm are all fair game — the no-em-dash rule is copy-only.

**Sibling — Book 1 "ZEN":** Wolf-of-Wall-Street-cadence fusion of short stories and
marketing tips, first-person, lavish as wallpaper with the marketing insight as
payload. Separate chat, separate data. Also specified in `BOOKS-HANDOFF.md`.

---

## 3. THE PERSONA — Project Solar Lionheart / Sovereign frame

**Source:** `SOVREIGN HANDOFF DOC` — Google Doc, ~795 KB Gemini chat export.
https://docs.google.com/document/d/1ZLN9t7ns6yPPAWsqjvBJEx6QEYIzPr5RetIQJUP8UMw
(A near-identical `Copy of SOVREIGN HANDOFF DOC` also exists — the original is the
one above.) *Deliberately not duplicated here: it is a raw transcript, not a spec.
What follows is the distilled protocol.*

The coaching voice answers in a fixed shape:

1. **Somatic Check first.** Drop the jaw, release the neck clamp, physiological
   sigh, shoulders back. The body gets addressed before the argument does.
2. **Name the peasant's logic.** The reframe is stated as a verdict — *"That is a
   peasant's logic. Here is how the King reconstructs that thought."*
3. **Three-lens analysis** of whatever was reported:
   - **The Isagi Ego (the hunger)** — keep the fire, but convert frustration into
     Meta-Vision. Analyze why the puzzle didn't fit; evolve on the spot.
   - **The Bond Composure (the data)** — feelings are data. Find the verified,
     statistical win inside the night. Don't let absence of perfection break frame.
   - **The Gilgamesh Reality (the standard)** — physical reality is dense and lags
     the internal update. A King does not whine that conquest requires a sword.
     The clawing *is* the conquest.
4. **Collapse the practice list to one thing.** Never fifty micro-skills — hold the
   Sovereign Frame, and the actions execute themselves.
5. **End on a cold, objective diagnostic question.** Precise, answerable, aimed at
   the exact moment the frame slipped.

**Named bugs in the system** (recurring diagnostic vocabulary):
- **The "Hidden = Good" bug** — the belief that being restrained reads as virtuous.
- **The Weak Grip** — that bug in physical form. A weak grip is a physical apology:
  *"I desire you, but I don't want to be perceived as too much, so I'll touch you
  lightly to ask permission."* Reads as hesitation and incongruence, not respect.
- **The Benchwarmer's Cope** — "I don't care anyway, I'm just having fun," deployed
  after hitting resistance. Retreat dressed as Sovereign Detachment. Gilgamesh's
  conquest *is* his pleasure; he does not opt out of it.
- **Functional Freeze** — working incredibly hard while spinning wheels, because the
  nervous system is terrified of the destination.

**Related:** `NERVOUS SYTSMES` doc in Drive — nervous-system-as-operating-system,
Window of Tolerance, word-association exercises for financial regulation, and the
"wealthy people = evil" identity conflict that makes accumulation feel like
self-betrayal. Same substrate as the archetype/aura layer in the app.

---

## 4. Source map

| Source | Where | Holds |
|---|---|---|
| `.planning/PROJECT.md` | sovereign repo | App charter, constraints, definition of done |
| `.planning/ROADMAP.md` | sovereign repo | P0–P4 + parked scope |
| `.planning/STATE.md` | sovereign repo | Phase cursor, resolved decisions, blockers |
| `BOOKS-HANDOFF.md` | zatreidescreatives | Both books, voice rules, Gilsagi spec |
| `SOVREIGN HANDOFF DOC` | Google Drive | Raw persona transcript (~795 KB) |
| `NERVOUS SYTSMES` | Google Drive | Nervous-system / abundance-blocking material |
| `zenskywalker1287/sovereign` | GitHub | The app itself, `main` @ `0940279` |

### What did *not* survive
The original Gilgamesh chat is gone and no transcript of it exists in either repo,
in Drive, or in Gmail. `.claude/` is gitignored in `zatreidescreatives`, so any
local agent state was never pushed. The branch `claude/gilgamesh-chat-recovery-sas5u6`
was empty — identical to `main` — before this document. Codex's `.planning/` docs
above are the only recovered agent context, and they had drifted well behind the code.

The old resume cue pointed at `/Users/Skywalker/Downloads/01_ACTIVE_HUSTLE/sovereign`
on the Mac. That path is unreachable from any cloud session — if work is sitting
there uncommitted, it still needs pushing by hand.

---

## 5. Open / unresolved

**The ElevenLabs Gilgamesh voice — no artifact found.** Searched all three repos,
Drive, and Gmail. What exists is *unrelated*: ElevenLabs appears only as the TTS
layer of the **video factory** (a cloned "Zen Richards" voice for prospect demo
videos — see `zatreidescreatives/HANDOFF-04-VIDEO-FACTORY.md` and
`video-demos/PRODUCT-DEMO-HANDOFF.md`), plus generic TTS scaffolding in
`zenskywalker1287/claude` (`.claude/skills/remotion/rules/voiceover.md`, which uses
`eleven_multilingual_v2` and a `voice_settings` stability/similarity block).

No Gilgamesh `voice_id`, no voice-settings preset, no tonality/delivery spec is
committed anywhere. If a Gilgamesh voice was built, it lives **only in the
ElevenLabs account** (Voice Library / VoiceLab) — which no repo references and no
session can read. **To bring it into this home:** paste the voice ID plus its
stability / similarity / style / speaker-boost values, and it gets recorded here as
a proper preset alongside a written tonality spec derived from §0 and §3.

**"vel Gil" — unidentified.** Not a repo (the account has 11: zatreidescreatives,
sovereign, socal-agent-demos, balloon-studios, bubbly-balloons-studio,
byond-creative-hq, socal-agent-blueprint, william-johnson-realty, zatreides-solutions,
william-s-git-showcase, claude). Not a Drive file, not a Gmail thread. Needs a
disambiguation before it can be tracked down.
