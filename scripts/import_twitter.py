#!/usr/bin/env python3
"""
Process an X (Twitter) archive ZIP into vault markdown.

What X's archive contains:
  - data/bookmarks.js          — your bookmarks: window.YTD.bookmark.part0 = [...]
  - data/tweets.js             — your own tweets
  - data/like.js               — your likes
  - (each entry has tweetId + url, full text only for your own tweets)

We surface bookmarks + likes as URL stubs. Use transcribe_url.py to fetch tweet text later.

Usage:
    python import_twitter.py path/to/twitter-archive.zip
    python import_twitter.py path/to/extracted/  --vault /custom/path
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path

from _lib import vault_path, write_md, make_filename, progress, today_iso


JS_ASSIGN = re.compile(r'^[^=]+=\s*', re.M)


def parse_js(blob: bytes) -> list | dict:
    """X stores data as JS files: `window.YTD.X.part0 = [...]`. Strip assignment, parse JSON."""
    text = blob.decode('utf-8', errors='replace')
    text = JS_ASSIGN.sub('', text, count=1).strip().rstrip(';').strip()
    return json.loads(text)


def iter_export(src: Path):
    if src.is_file() and src.suffix == '.zip':
        with zipfile.ZipFile(src) as z:
            for name in z.namelist():
                if name.endswith('/'):
                    continue
                yield name, z.read(name)
    elif src.is_dir():
        for p in src.rglob('*'):
            if p.is_file():
                yield str(p.relative_to(src)), p.read_bytes()
    else:
        sys.exit(f'Source not found: {src}')


def find_data(src: Path, basename: str):
    for name, blob in iter_export(src):
        if name.endswith('/' + basename) or name == basename or name.endswith(basename):
            try:
                return parse_js(blob)
            except Exception as e:
                print(f'  ! failed to parse {name}: {e}', file=sys.stderr)
                continue
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src', help='X archive .zip OR extracted folder')
    ap.add_argument('--vault', help='vault root override')
    ap.add_argument('--dest', default='08-LIBRARY/twitter-bookmarks', help='destination folder in vault')
    ap.add_argument('--include-likes', action='store_true', help='also import your likes (separate folder)')
    args = ap.parse_args()

    src = Path(args.src)
    vault = vault_path(args.vault)

    print(f'Reading {src} …')
    bookmarks = find_data(src, 'bookmarks.js') or []
    if not isinstance(bookmarks, list):
        bookmarks = []

    items: list[dict] = []
    for entry in bookmarks:
        b = entry.get('bookmark', entry)
        url = b.get('expandedUrl') or b.get('fullUrl') or ''
        tweet_id = b.get('tweetId') or (url.split('/')[-1] if '/status/' in url else '')
        if not url:
            # Sometimes only tweetId is present — reconstruct URL
            if tweet_id:
                url = f'https://twitter.com/i/web/status/{tweet_id}'
            else:
                continue
        items.append({'url': url, 'tweet_id': tweet_id, 'kind': 'bookmark'})

    out_dir = vault / args.dest
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f'Found {len(items)} bookmarks. Writing to {out_dir} …')
    written = 0
    for i, it in enumerate(items, 1):
        stem = f"bookmark-{it['tweet_id'] or i}"
        fname = make_filename(stem)
        path = out_dir / fname
        body = f"[{it['url']}]({it['url']})\n\n*No tweet text yet — run `transcribe_url.py {it['url']}` to fetch.*"
        write_md(path, {
            'url': it['url'],
            'source': 'twitter',
            'type': 'tweet',
            'kind': it['kind'],
            'tweet_id': it['tweet_id'],
            'saved_at': today_iso(),
            'processed': False,
            'tags': ['twitter', 'bookmark'],
        }, body)
        written += 1
        if i % 25 == 0 or i == len(items):
            progress(i, len(items), it['tweet_id'])
    print(f'\n✓ Wrote {written} bookmark files to {out_dir}')

    if args.include_likes:
        likes = find_data(src, 'like.js') or []
        if isinstance(likes, list) and likes:
            like_dir = vault / '08-LIBRARY/twitter-likes'
            like_dir.mkdir(parents=True, exist_ok=True)
            print(f'Found {len(likes)} likes. Writing to {like_dir} …')
            for i, entry in enumerate(likes, 1):
                like = entry.get('like', entry)
                url = like.get('expandedUrl') or like.get('fullText', '') or ''
                tweet_id = like.get('tweetId') or ''
                if not url and tweet_id:
                    url = f'https://twitter.com/i/web/status/{tweet_id}'
                if not url:
                    continue
                stem = f"like-{tweet_id or i}"
                path = like_dir / make_filename(stem)
                full_text = like.get('fullText') or ''
                body = f"[{url}]({url})\n\n{full_text}" if full_text else f"[{url}]({url})\n\n*No tweet text yet — run `transcribe_url.py {url}`.*"
                write_md(path, {
                    'url': url, 'source': 'twitter', 'type': 'tweet', 'kind': 'like',
                    'tweet_id': tweet_id, 'saved_at': today_iso(), 'processed': bool(full_text),
                    'tags': ['twitter', 'like'],
                }, body)
                if i % 100 == 0 or i == len(likes):
                    progress(i, len(likes), tweet_id)
            print(f'\n✓ Wrote {len(likes)} like files.')


if __name__ == '__main__':
    main()
