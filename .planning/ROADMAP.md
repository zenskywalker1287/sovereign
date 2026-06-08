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

## P1 — Lockable + Persistent + Real Engine (in progress)
**Goal:** App becomes daily-usable. Data sticks. Locked down.

- [ ] **Passcode auth gate** — set on first launch, enter on every open, 5-fail lockout, reset path
- [ ] **Persistent Zustand store** — missions (check states by date), archetypes (xp + level), aura (% + streak + last active date), lifetime stats (xp, drills, words, longest streak)
- [ ] **Wire Home tab** to live aura + today's mission from store
- [ ] **Wire Missions tab** to store with check writeback + per-date persistence
- [ ] **Wire Archetypes tab** to real xp + level math + per-archetype detail sheet stub
- [ ] **Wire Profile tab** to real lifetime stats
- [ ] **XP engine** — drill submit awards XP to archetype mapped by drill author/lane, bumps streak, recomputes aura
- [ ] **Graded History view** — list real graded files from vault, score-over-time sparkline, drill into one
- [ ] **Settings → wipe-all-data button** (with confirmation)

## P2 — Mental Diet + Vault Surfaces (next)
- Mental Diet feature: Write / Study / Watch / Think slots, generated daily
- Surprise Me: cross-vault note connection
- Watch flow: paste YouTube → Gemini summary → save to vault
- Note Reader: render arbitrary `.md` from vault with `[[wikilink]]` resolution
- Journal entry write screen

## P3 — Real Vault Sync (blocked: disk)
- Move SOVEREIGN/ from Obsidian's iCloud container to standard iCloud Drive
- Swap WebAdapter → CapacitorAdapter on iOS
- Reconfirm bidirectional sync with Obsidian Mac + Mobile

## P4 — Native iOS (long-term)
- Free up disk → install Xcode → Capacitor iOS target → sideload via free provisioning

## Out of scope (parked)
- Android signing
- Speech Gym
- Labs / experiments tab
- Notion live sync
- TestFlight ($99/yr deferred)
