#!/usr/bin/env python3
"""
Process an Instagram Meta data download ZIP into vault markdown.

What Meta's IG export contains (as of 2026):
  - your_instagram_activity/saved/saved_posts.json
  - your_instagram_activity/saved/saved_collections.json
  - your_instagram_activity/likes/liked_posts.json
  - your_instagram_activity/likes/liked_comments.json
  - (no captions, no media — just URLs + timestamps)

We produce one .md per saved item with frontmatter:
  url, source: instagram, type, saved_at, processed: false, tags

Usage:
    python import_instagram.py path/to/instagram-export.zip
    python import_instagram.py path/to/extracted/  --vault /custom/path
"""
from __future__ import annotations

import argparse
import json
import sys
import zipfile
from datetime import datetime
from pathlib import Path

from _lib import vault_path, write_md, make_filename, progress, today_iso


def iter_export(src: Path):
    """Yield (relative_path, file_bytes) from either a ZIP or an extracted folder."""
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


def find_json(export_src: Path, basename: str) -> dict | list | None:
    """Find a JSON file by basename anywhere in the export."""
    for name, data in iter_export(export_src):
        if name.endswith('/' + basename) or name.endswith(basename):
            try:
                return json.loads(data.decode('utf-8'))
            except Exception:
                continue
    return None


def extract_saved_urls(saved_posts_json) -> list[dict]:
    """
    IG's saved_posts.json shape (varies between exports):
      {"saved_saved_media": [
        {"title": "@username", "string_map_data": {
          "Saved on": {"href": "https://www.instagram.com/p/...", "timestamp": 17...}}}]}
    """
    out: list[dict] = []
    if not saved_posts_json:
        return out
    items = saved_posts_json.get('saved_saved_media', saved_posts_json) if isinstance(saved_posts_json, dict) else saved_posts_json
    if not isinstance(items, list):
        return out
    for it in items:
        title = it.get('title') or it.get('username') or ''
        smd = it.get('string_map_data') or {}
        sub = smd.get('Saved on') or {}
        url = sub.get('href') or it.get('href') or ''
        ts = sub.get('timestamp') or it.get('timestamp') or 0
        if not url:
            continue
        try:
            saved_at = datetime.fromtimestamp(int(ts)).strftime('%Y-%m-%d') if ts else today_iso()
        except Exception:
            saved_at = today_iso()
        kind = 'reel' if '/reel/' in url else 'post' if '/p/' in url else 'unknown'
        out.append({'url': url, 'username': title.lstrip('@'), 'saved_at': saved_at, 'type': kind})
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src', help='IG export .zip OR extracted folder')
    ap.add_argument('--vault', help='vault root override')
    ap.add_argument('--dest', default='08-LIBRARY/instagram-saves', help='destination folder in vault')
    args = ap.parse_args()

    src = Path(args.src)
    vault = vault_path(args.vault)
    out_dir = vault / args.dest
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f'Reading {src} …')
    saved_posts = find_json(src, 'saved_posts.json')
    liked_posts = find_json(src, 'liked_posts.json')

    items: list[dict] = []
    items.extend({**i, 'kind': 'saved'} for i in extract_saved_urls(saved_posts or {}))

    # Liked posts use the same shape under a different top-level key.
    liked = liked_posts.get('likes_media_likes', liked_posts) if isinstance(liked_posts, dict) else (liked_posts or [])
    if isinstance(liked, list):
        for it in liked:
            title = it.get('title') or ''
            smd = it.get('string_map_data') or {}
            sub = smd.get('Time') or smd.get('Liked on') or {}
            url = sub.get('href') or ''
            ts = sub.get('timestamp') or 0
            if not url:
                continue
            try:
                saved_at = datetime.fromtimestamp(int(ts)).strftime('%Y-%m-%d') if ts else today_iso()
            except Exception:
                saved_at = today_iso()
            kind = 'reel' if '/reel/' in url else 'post' if '/p/' in url else 'unknown'
            items.append({'url': url, 'username': title.lstrip('@'), 'saved_at': saved_at, 'type': kind, 'kind': 'liked'})

    if not items:
        sys.exit('No saved or liked posts found in export. Wrong file?')

    print(f'Found {len(items)} items. Writing to {out_dir} …')
    written = 0
    for i, it in enumerate(items, 1):
        stem = f"{it['saved_at']}_{it['username'] or 'ig'}_{it['url'].rstrip('/').split('/')[-1]}"
        fname = make_filename(stem)
        path = out_dir / fname
        body = f"[{it['url']}]({it['url']})\n\n*No content yet — run `transcribe_url.py {it['url']}` to fetch caption/video.*"
        write_md(path, {
            'url': it['url'],
            'source': 'instagram',
            'type': it['type'],
            'kind': it['kind'],
            'username': it['username'],
            'saved_at': it['saved_at'],
            'processed': False,
            'tags': ['instagram', it['type']],
        }, body)
        written += 1
        if i % 25 == 0 or i == len(items):
            progress(i, len(items), it.get('username', ''))

    print(f'\n✓ Wrote {written} files to {out_dir}')
    print('Run `bulk_transcribe.py {dest}` to fill in reel transcripts.'.format(dest=args.dest))


if __name__ == '__main__':
    main()
