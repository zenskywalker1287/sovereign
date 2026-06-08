# Apple Shortcut — "Save to SOVEREIGN"

A 30-second Apple Shortcut so anything you see in Safari / IG / X / YouTube can land in your vault inbox with one share-sheet tap. No app code, no automation, just iOS built-ins.

## What it does

You're scrolling X → see a banger tweet → tap **Share → Save to SOVEREIGN** → tweet URL is appended to today's `00-INBOX/{YYYY-MM-DD}.md` file. Done. Process it later in Obsidian.

## Build it (one-time, 5 min on iPhone)

1. Open **Shortcuts** app on iPhone → bottom-right `+`
2. Tap **Add Action**
3. Search & add **"Show in Share Sheet"** → toggle ON → **Accept** = URL, Text
4. Add **"Get Current Date"** action → Format `2026-06-08`
5. Add **"Text"** action → content (use the variable picker for `Current Date` and `Shortcut Input`):
   ```
   - [Captured Current Date] Shortcut Input
   ```
6. Add **"Append to File"** action (under Files):
   - **File:** Tap → choose **iCloud Drive → Obsidian → SOVEREIGN → 00-INBOX → {Current Date}.md**  
     *Tip: if today's file doesn't exist yet, create it once in Obsidian first.*
   - **Append:** `Text` (the variable from step 5)
   - **New line:** ON
7. Top-right share-icon → name it **"Save to SOVEREIGN"** → pick an icon
8. Done. Test from any app: tap Share → scroll → **Save to SOVEREIGN**.

## How to actually use it

- **Twitter/X:** tweet menu → Share → Save to SOVEREIGN
- **Instagram reel:** tap ⋯ → Copy Link → open Shortcuts widget OR paste URL into Safari share sheet
- **YouTube:** Share → Save to SOVEREIGN
- **Safari any page:** Share → Save to SOVEREIGN

Each capture lands as ONE LINE in today's inbox file:
```
- [Captured 2026-06-08] https://twitter.com/user/status/12345
- [Captured 2026-06-08] https://www.instagram.com/reel/ABC/
```

Process them later in Obsidian: cut/move to their permanent home, or run `transcribe_url.py` on any one to fetch text.

## Why not a "real" iOS app?

You eventually get one — the SOVEREIGN app. The Shortcut is the gap-bridge until then. Apple's Shortcuts are already perfect for this and need zero maintenance.
