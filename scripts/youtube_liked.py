#!/usr/bin/env python3
"""
Pull your YouTube Liked Videos via YouTube Data API v3 and write one .md per
video to the vault, with the full transcript inlined when YouTube has captions
(free, instant, no Gemini compute).

Usage:
    python youtube_liked.py --key AIza...
    python youtube_liked.py --key AIza... --max 50   (cap for testing)
    python youtube_liked.py --key AIza... --no-transcript  (URLs only)

Get a key:
  1. console.cloud.google.com → new project "sovereign"
  2. APIs & Services → Library → "YouTube Data API v3" → Enable
  3. Credentials → Create credentials → API key → copy

NOTE: This pulls VIDEOS you "Liked" (👍). YouTube deprecated Watch Later API access
in 2016 — for Watch Later, use Google Takeout instead (it's in the ZIP).
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from _lib import vault_path, write_md, make_filename, progress, today_iso

try:
    from googleapiclient.discovery import build
except ImportError:
    sys.exit('pip install google-api-python-client')

try:
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
    HAS_TRANSCRIPT_API = True
except ImportError:
    HAS_TRANSCRIPT_API = False
    print('! pip install youtube-transcript-api — transcripts will be skipped.', file=sys.stderr)


def fetch_liked(api_key: str, max_results: int | None = None) -> list[dict]:
    """OAuth-less: API key auth + the 'mine=true' trick doesn't work; we have to
    query the public LL (Liked Videos) playlist for the authenticated user.
    With API key only (no OAuth), we can't access 'mine=true' playlists directly.
    Workaround: API key auth lets us list ANY public playlist by ID. For your
    own Liked Videos we'd need OAuth. To avoid the OAuth dance, this script
    pulls a user-supplied PLAYLIST ID instead — set --playlist LLxxx (your liked
    videos playlist URL) or paste a public playlist of yours.

    Simpler workflow for users: download Liked via Google Takeout (you get a CSV)
    and use `youtube_takeout.py` instead. This script handles ANY playlist by id.
    """
    yt = build('youtube', 'v3', developerKey=api_key)
    videos: list[dict] = []
    # We expect the caller to set --playlist. If they didn't, error early.
    raise NotImplementedError('Use youtube_takeout.py with the Liked Videos CSV from Google Takeout, or pass --playlist <ID>.')


def fetch_playlist(api_key: str, playlist_id: str, max_results: int | None = None) -> list[dict]:
    yt = build('youtube', 'v3', developerKey=api_key)
    videos: list[dict] = []
    page_token = None
    while True:
        resp = yt.playlistItems().list(
            part='snippet,contentDetails',
            playlistId=playlist_id,
            maxResults=50,
            pageToken=page_token,
        ).execute()
        for item in resp.get('items', []):
            sn = item['snippet']
            videos.append({
                'video_id': sn['resourceId']['videoId'],
                'title': sn['title'],
                'channel': sn.get('videoOwnerChannelTitle') or sn.get('channelTitle', ''),
                'published': sn.get('publishedAt', '')[:10],
                'description': sn.get('description', ''),
                'thumbnail': (sn.get('thumbnails') or {}).get('high', {}).get('url', ''),
            })
            if max_results and len(videos) >= max_results:
                return videos
        page_token = resp.get('nextPageToken')
        if not page_token:
            break
    return videos


def fetch_transcript(video_id: str) -> str | None:
    if not HAS_TRANSCRIPT_API:
        return None
    try:
        chunks = YouTubeTranscriptApi.get_transcript(video_id)
        return '\n'.join(c['text'] for c in chunks if c.get('text'))
    except (TranscriptsDisabled, NoTranscriptFound):
        return None
    except Exception:
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--key', required=True, help='YouTube Data API v3 key (AIza…)')
    ap.add_argument('--playlist', help='Playlist ID to import (or "liked" for your Liked Videos via Takeout instead)')
    ap.add_argument('--max', type=int, help='cap number of videos for testing')
    ap.add_argument('--no-transcript', action='store_true', help='skip transcript fetching')
    ap.add_argument('--vault', help='vault root override')
    ap.add_argument('--dest', default='08-LIBRARY/youtube-liked', help='destination folder')
    args = ap.parse_args()

    if not args.playlist:
        sys.exit('Pass --playlist PLAYLIST_ID. For your Liked Videos, get the ID by opening the Liked Videos playlist on youtube.com and copying "LL..." from the URL. Some accounts hide this — fall back to Google Takeout (Liked videos.csv).')

    vault = vault_path(args.vault)
    out_dir = vault / args.dest
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f'Fetching playlist {args.playlist} …')
    videos = fetch_playlist(args.key, args.playlist, max_results=args.max)
    print(f'Got {len(videos)} videos.')

    for i, v in enumerate(videos, 1):
        url = f'https://www.youtube.com/watch?v={v["video_id"]}'
        transcript = None if args.no_transcript else fetch_transcript(v['video_id'])
        body_parts = [f'**{v["title"]}**', f'by *{v["channel"]}*  ·  {v["published"]}', '', f'[{url}]({url})']
        if v.get('description'):
            body_parts.append('')
            body_parts.append('## Description')
            body_parts.append(v['description'][:2000])
        if transcript:
            body_parts.append('')
            body_parts.append('## Transcript')
            body_parts.append(transcript[:50_000])
        body = '\n'.join(body_parts)

        stem = f"{v['published']}_{v['channel']}_{v['title']}"
        path = out_dir / make_filename(stem)
        write_md(path, {
            'url': url,
            'source': 'youtube',
            'type': 'video',
            'video_id': v['video_id'],
            'channel': v['channel'],
            'published': v['published'],
            'title': v['title'],
            'has_transcript': bool(transcript),
            'saved_at': today_iso(),
            'processed': bool(transcript),
            'tags': ['youtube', 'video'],
        }, body)
        progress(i, len(videos), v['title'])

    print(f'\n✓ Wrote {len(videos)} files to {out_dir}')


if __name__ == '__main__':
    main()
