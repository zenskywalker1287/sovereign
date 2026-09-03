# SOVEREIGN — Roadmap

## P0 — Shell + Studio (✅ shipped 2026-05-30)
- 5-tab app shell (Home · Missions · Archetypes · Brain · Profile)
- iOS 18 tokens, light + dark auto
- Writing Studio MVP: lane → drill → editor + timer → grade → save
- 14 drills incl. 6 Halbert + 6 Meyer/general + 2 freeform
- Grading engine: OpenRouter (Llama 3.3 70B free default) + Gemini fallback
- Settings sheet with provider/model picker + API key input
- PWA manifest + icons + service worker
- GH Pages deploy at https://zenskywalker1287.github.io/sovereign/

## P1 — Lockable + Persistent + Real Engine (✅ shipped)
**Goal:** App becomes daily-usable. Data sticks. Locked down.

- [x] **Passcode auth gate** — set on first launch, enter on every open, 5-fail lockout, reset path
- [x] **Persistent Zustand store** — missions (check states by date), archetypes (xp + level), aura (% + streak + last active date), lifetime stats (xp, drills, words, longest streak)
- [x] **Wire Home tab** to live aura + today's mission from store
- [x] **Wire Missions tab** to store with check writeback + per-date persistence
- [x] **Wire Archetypes tab** to real xp + level math + per-archetype detail sheet stub
- [x] **Wire Profile tab** to real lifetime stats
- [x] **XP engine** — drill submit awards XP to archetype mapped by drill author/lane, bumps streak, recomputes aura
- [x] **Graded History view** — list real graded files from vault, score-over-time sparkline, drill into one
- [x] **Settings → wipe-all-data button** (with confirmation)

## P2 — Mental Diet + Vault Surfaces (✅ shipped)
- [x] Mental Diet feature: Write / Study / Watch / Think slots, generated daily
- [x] Surprise Me: cross-vault note connection
- [x] Watch flow: paste YouTube → Gemini summary → save to vault
- [x] Note Reader: render arbitrary `.md` from vault with `[[wikilink]]` resolution
- [x] Journal entry write screen

## P3 — Real Vault Sync (blocked: disk)
- Move SOVEREIGN/ from Obsidian's iCloud container to standard iCloud Drive
- Swap WebAdapter → CapacitorAdapter on iOS
- Reconfirm bidirectional sync with Obsidian Mac + Mobile

## P4 — Native iOS (long-term)
- Free up disk → install Xcode → Capacitor iOS target → sideload via free provisioning

## Shipped outside the plan
- Speech Gym — drill bank, timed practice, monologue generator, rules/problems screens
- Custom tasks — daily / weekly / monthly with XP + archetype routing
- AI coach personas — Halbert, Meyer, Speech Coach (`src/domain/coach.ts`)
- Appearance/theme system + notifications
- Bookmarks toolkit + universal transcriber
- College-course structure for COPY / FICTION / SPEECH
- 5-tab relabel → To Do · Ascension · Mind · Library · Me

## Out of scope (parked)
- Android signing
- ~~Speech Gym~~ — UNPARKED and shipped; see `src/routes/speech/`
- Labs / experiments tab
- Notion live sync
- TestFlight ($99/yr deferred)
