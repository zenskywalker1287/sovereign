# SOVEREIGN bookmarks toolkit

Local Python scripts that turn platform exports into vault markdown.

Vault is hard-coded to `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/SOVEREIGN`.
Pass `--vault PATH` to override.

## Setup (one-time)

```bash
cd ~/Downloads/01_ACTIVE_HUSTLE/sovereign/scripts
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Scripts

| Script | Input | Output |
|--------|-------|--------|
| `import_instagram.py PATH/TO/instagram-zip` | Meta IG data download ZIP | `08-LIBRARY/instagram-saves/*.md` one per save |
| `import_twitter.py PATH/TO/twitter-zip`    | X archive ZIP             | `08-LIBRARY/twitter-bookmarks/*.md` one per bookmark |
| `import_linkedin.py PATH/TO/linkedin-zip`  | LinkedIn data download ZIP| `08-LIBRARY/linkedin-saved/*.md` one per save |
| `youtube_liked.py --key AIza...`           | YT Data API v3 key        | `08-LIBRARY/youtube-liked/*.md` one per liked video + transcript when available |
| `transcribe_url.py URL`                    | Any YouTube URL           | Prints transcript to stdout; saves to `08-LIBRARY/transcripts/{slug}.md` |
| `bulk_transcribe.py PATH/TO/folder`        | Folder of YT vault notes  | Adds full transcript to each note's body when missing |

## Typical flow

1. Request the official export ZIPs (24-48 hr wait).
2. Run YT API key script TODAY to pull Liked Videos + transcripts.
3. When ZIPs arrive: run the matching `import_*.py` for each platform.
4. Run `bulk_transcribe.py` over `youtube-liked/` to backfill any missing transcripts.
5. Open Obsidian → all 4 platform folders populated.

Every save-note has YAML frontmatter:
```yaml
url: https://...
source: instagram | twitter | youtube | linkedin
saved_at: 2026-05-15
type: post | reel | video | tweet | article
processed: false
tags: []
```

`processed: false` lets you queue items: Dataview can list everything where `processed != true`.
