#!/usr/bin/env python3
"""
Process Google Takeout's YouTube CSV exports (Liked videos.csv, Watch Later.csv,
Subscriptions.csv) into vault markdown — pulls transcripts for free via the
youtube-transcript-api.

Usage:
    python youtube_takeout.py path/to/Takeout/YouTube/history/playlists/Liked\\ videos.csv
    python youtube_takeout.py path/to/Watch\\ Later.csv --dest 08-LIBRARY/youtube-watch-later
"""
from __future__ import annotations

import argparse
import csv
import sys
import time
from pathlib import Path

from _lib import vault_path, write_md, make_filename, progress, today_iso

try:
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
except ImportError:
    sys.exit('pip install youtube-transcript-api')


def parse_csv(path: Path) -> list[dict]:
    """Takeout CSVs vary in shape. Find the video ID column heuristically."""
    rows: list[dict] = []
    with path.open(encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        for row in reader:
            vid = (
                row.get('Video ID')
                or row.get('Video Id')
                or row.get('Content ID')
                or row.get('Url', '').split('=')[-1] if 'watch?v=' in row.get('Url', '') else ''
            )
            ts = row.get('Created Timestamp') or row.get('Saved at') or row.get('Time')
            if vid and len(vid) == 11:  # YT video IDs are exactly 11 chars
                rows.append({'video_id': vid, 'when': ts or today_iso()})
    return rows


def fetch_transcript(video_id: str) -> str | None:
    try:
        chunks = YouTubeTranscriptApi.get_transcript(video_id)
        return '\n'.join(c['text'] for c in chunks if c.get('text'))
    except (TranscriptsDisabled, NoTranscriptFound):
        return None
    except Exception as e:
        print(f'  ! transcript failed for {video_id}: {type(e).__name__}', file=sys.stderr)
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('csv_path', help='Takeout CSV (e.g. Liked videos.csv)')
    ap.add_argument('--vault', help='vault root override')
    ap.add_argument('--dest', default='08-LIBRARY/youtube-liked', help='destination folder')
    ap.add_argument('--max', type=int, help='cap for testing')
    ap.add_argument('--sleep', type=float, default=0.3, help='seconds between requests (rate-limit safety)')
    args = ap.parse_args()

    src = Path(args.csv_path)
    if not src.exists():
        sys.exit(f'Not found: {src}')
    vault = vault_path(args.vault)
    out_dir = vault / args.dest
    out_dir.mkdir(parents=True, exist_ok=True)

    rows = parse_csv(src)
    if args.max:
        rows = rows[: args.max]
    print(f'Found {len(rows)} videos in CSV. Processing …')

    transcripts_got = 0
    for i, row in enumerate(rows, 1):
        vid = row['video_id']
        url = f'https://www.youtube.com/watch?v={vid}'
        transcript = fetch_transcript(vid)
        if transcript:
            transcripts_got += 1

        body_parts = [f'[{url}]({url})']
        if transcript:
            body_parts += ['', '## Transcript', transcript[:80_000]]
        else:
            body_parts += ['', '*No transcript available — run `transcribe_url.py` with Whisper to extract from audio.*']

        path = out_dir / make_filename(f'{vid}')
        write_md(path, {
            'url': url,
            'source': 'youtube',
            'type': 'video',
            'video_id': vid,
            'has_transcript': bool(transcript),
            'saved_at': today_iso(),
            'processed': bool(transcript),
            'tags': ['youtube', 'video'],
        }, '\n'.join(body_parts))
        progress(i, len(rows), vid)
        time.sleep(args.sleep)

    print(f'\n✓ Wrote {len(rows)} files. Transcripts found for {transcripts_got}/{len(rows)}.')


if __name__ == '__main__':
    main()
