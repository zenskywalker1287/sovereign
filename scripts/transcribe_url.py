#!/usr/bin/env python3
"""
Universal URL → transcript pipeline.

  YouTube URL  →  free transcript via youtube-transcript-api  (no API costs)
  IG reel URL  →  yt-dlp downloads audio  →  OpenAI Whisper transcribes  →  delete tmp
  X video URL  →  same as IG reel
  TikTok       →  same as IG reel
  Anything else→  same fallback

Saves a structured note to 08-LIBRARY/transcripts/{slug}.md and prints to stdout.

Setup (one-time):
    brew install yt-dlp ffmpeg      # or `pip install yt-dlp`
    pip install youtube-transcript-api openai
    export OPENAI_API_KEY=sk-...

Usage:
    python transcribe_url.py "https://www.instagram.com/reel/Cxyz/"
    python transcribe_url.py "https://twitter.com/user/status/123"
    python transcribe_url.py "https://www.youtube.com/watch?v=jNQXAC9IVRw"

Disk discipline: downloads to a temp file, transcribes, deletes the audio file.
Only the transcript text is kept (~5 KB per video).
"""
from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from _lib import vault_path, write_md, make_filename, today_iso


YT_RE = re.compile(r'(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})')


def youtube_id(url: str) -> str | None:
    m = YT_RE.search(url)
    return m.group(1) if m else None


def yt_transcript(video_id: str) -> str | None:
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
    except ImportError:
        return None
    try:
        chunks = YouTubeTranscriptApi.get_transcript(video_id)
        return '\n'.join(c['text'] for c in chunks if c.get('text'))
    except (TranscriptsDisabled, NoTranscriptFound):
        return None
    except Exception as e:
        print(f'  ! youtube-transcript-api failed: {e}', file=sys.stderr)
        return None


def yt_dlp_download(url: str, dest_dir: Path) -> tuple[Path | None, dict]:
    """Download audio-only to dest_dir. Returns (audio_path, metadata)."""
    outtmpl = str(dest_dir / '%(id)s.%(ext)s')
    cmd = [
        'yt-dlp',
        '-f', 'bestaudio',
        '--extract-audio', '--audio-format', 'mp3',
        '--audio-quality', '5',
        '--no-playlist',
        '--print', '%(id)s|%(title)s|%(uploader)s|%(duration)s',
        '-o', outtmpl,
        url,
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    except FileNotFoundError:
        sys.exit('yt-dlp not installed. Run: brew install yt-dlp ffmpeg  (or pip install yt-dlp)')
    if result.returncode != 0:
        print(result.stderr, file=sys.stderr)
        return None, {}
    parts = (result.stdout.strip().split('|') + ['', '', '', ''])[:4]
    meta = {'id': parts[0], 'title': parts[1], 'uploader': parts[2], 'duration': parts[3]}
    # Find the downloaded file
    for ext in ('mp3', 'm4a', 'webm', 'ogg'):
        candidate = dest_dir / f"{meta['id']}.{ext}"
        if candidate.exists():
            return candidate, meta
    return None, meta


def openai_whisper(audio_path: Path) -> str | None:
    try:
        from openai import OpenAI
    except ImportError:
        sys.exit('pip install openai')
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        sys.exit('Set OPENAI_API_KEY env var (platform.openai.com/api-keys).')
    client = OpenAI(api_key=api_key)
    with audio_path.open('rb') as f:
        resp = client.audio.transcriptions.create(model='whisper-1', file=f, response_format='text')
    return str(resp).strip()


def detect_platform(url: str) -> str:
    url = url.lower()
    if 'youtube.com' in url or 'youtu.be' in url: return 'youtube'
    if 'instagram.com' in url: return 'instagram'
    if 'twitter.com' in url or 'x.com' in url: return 'twitter'
    if 'tiktok.com' in url: return 'tiktok'
    if 'linkedin.com' in url: return 'linkedin'
    return 'other'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('url')
    ap.add_argument('--vault', help='vault root override')
    ap.add_argument('--dest', default='08-LIBRARY/transcripts', help='destination folder')
    ap.add_argument('--print-only', action='store_true', help="don't save to vault, just print")
    ap.add_argument('--engine', choices=['auto', 'youtube', 'whisper'], default='auto')
    args = ap.parse_args()

    url = args.url
    platform = detect_platform(url)
    vault = vault_path(args.vault) if not args.print_only else None

    transcript: str | None = None
    metadata: dict = {'platform': platform}

    # YouTube fast path
    vid = youtube_id(url)
    if vid and args.engine in ('auto', 'youtube'):
        print(f'[YouTube] trying free transcript API for {vid} …', file=sys.stderr)
        transcript = yt_transcript(vid)
        if transcript:
            metadata['video_id'] = vid
            metadata['source_method'] = 'youtube-captions'

    # Fallback: download + Whisper
    if transcript is None and args.engine in ('auto', 'whisper'):
        print(f'[{platform}] downloading audio via yt-dlp …', file=sys.stderr)
        with tempfile.TemporaryDirectory() as td:
            audio_path, meta = yt_dlp_download(url, Path(td))
            metadata.update(meta)
            if not audio_path:
                sys.exit('yt-dlp could not download. Bad URL or auth required?')
            print(f'  audio: {audio_path.name} · transcribing with Whisper …', file=sys.stderr)
            transcript = openai_whisper(audio_path)
            metadata['source_method'] = 'openai-whisper'
            # audio_path auto-deleted when temp dir closes

    if not transcript:
        sys.exit('Could not transcribe.')

    # Output
    print(transcript)
    if args.print_only:
        return

    title = metadata.get('title') or vid or url
    stem = (metadata.get('uploader', '') + '-' + title)[:80]
    path = (vault / args.dest) / make_filename(stem)
    body = [f'[{url}]({url})', '']
    if metadata.get('title'):
        body.insert(0, f"**{metadata['title']}**")
        if metadata.get('uploader'):
            body.insert(1, f"by *{metadata['uploader']}*")
    body += ['## Transcript', transcript[:200_000]]
    write_md(path, {
        'url': url,
        'source': platform,
        'type': 'transcript',
        'title': metadata.get('title'),
        'uploader': metadata.get('uploader'),
        'duration': metadata.get('duration'),
        'video_id': metadata.get('video_id'),
        'source_method': metadata.get('source_method'),
        'saved_at': today_iso(),
        'processed': True,
        'tags': [platform, 'transcript'],
    }, '\n'.join(body))
    print(f'\n✓ Saved to {path}', file=sys.stderr)


if __name__ == '__main__':
    main()
