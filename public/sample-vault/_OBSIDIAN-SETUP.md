---
title: Obsidian Setup — TWO clicks
tags: [meta, setup]
updated: 2026-06-08
---

# Obsidian Setup — ALREADY DONE (2 clicks left)

I pre-installed everything for you. Plugin binaries, configs, dashboards, daily template, tag taxonomy, hotkeys, bookmarks — all live. You just have to click a button to authorize community plugins.

## What's already in place

- ✅ **Dataview** plugin installed (~2.3 MB) — powers every live dashboard
- ✅ **Templater** plugin installed (~328 KB) — auto-applies daily-note template
- ✅ **Tag Wrangler** plugin installed (~136 KB) — for safely renaming tags later
- ✅ Daily notes folder = `00-INBOX`, format = `YYYY-MM-DD`, template wired
- ✅ Templater folder-trigger on `00-INBOX/` → new file gets daily template auto-applied
- ✅ Dataview JS + inline queries enabled
- ✅ Bookmarks sidebar pre-populated with Dashboard / Halbert / Meyer / Speech / all 4 platform inboxes
- ✅ Hotkeys set: `Cmd+Shift+D` (today's note), `Cmd+O` (switcher), `Cmd+K` (palette), `Cmd+Shift+F` (search), `Cmd+\` (sidebar)
- ✅ New attachments → `08-LIBRARY/attachments/`
- ✅ `_OBSIDIAN-DASHBOARD.md` is your home — pin it after first launch

## The 2 clicks you need to do

### Click 1: Open this vault in Obsidian (first time)

Launch **Obsidian.app** → if a "vault picker" opens:
- "Open folder as vault" → navigate to and select:
  `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/SOVEREIGN`

If Obsidian opens a different vault, hit **Cmd+Shift+O** → "Open folder as vault" → same path.

### Click 2: Turn on community plugins (one-time, vault-level)

Inside Obsidian:
1. `Cmd+,` (Settings)
2. Left sidebar → **Community plugins**
3. Big button: **"Turn on community plugins"**
4. Click it. That's it.

Optional but recommended: **Reload Obsidian** (`Cmd+R` or quit/reopen) so the pre-staged plugins are picked up cleanly.

## What you'll see after Click 2

- Sidebar shows pinned **Bookmarks** (Dashboard, Halbert, Meyer, all platform folders)
- Open [[_OBSIDIAN-DASHBOARD]] — live Dataview tables show your unprocessed inbox, recent grades, watched transcripts, journal
- Hit `Cmd+Shift+D` — today's daily note opens with the template pre-applied
- Hit `Cmd+O` — fuzzy-search anything

## If anything looks wrong

- **Dataview queries show as raw text** → reload (Cmd+R). Plugin needs a beat after first enable.
- **"Trust plugin author?" dialog** → click Trust for Dataview, Templater, Tag Wrangler. They're all from official maintainers.
- **Daily template doesn't auto-apply** → Settings → Templater → check "Templates folder" = `05-SYSTEMS/templates`. Should already be set.

## Re-run setup later

If you ever wipe the `.obsidian/` folder or open this vault fresh on a new Mac, just run:

```bash
cd ~/Downloads/01_ACTIVE_HUSTLE/sovereign/scripts
./setup_obsidian.sh
```

Idempotent. Re-downloads latest plugin versions, rewrites all configs.

→ Now go to [[_OBSIDIAN-DASHBOARD]].
