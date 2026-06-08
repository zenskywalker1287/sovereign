#!/usr/bin/env python3
"""
Process a LinkedIn data download ZIP into vault markdown.

LinkedIn's export has multiple CSVs. The save-relevant ones:
  - Saved Articles.csv     — articles you saved
  - Saved Posts.csv         — posts you saved (when available)
  - Likes.csv               — your likes
LinkedIn's saved-posts coverage is INCOMPLETE — they don't export everything you've saved.
Treat as best-effort.

Usage:
    python import_linkedin.py path/to/linkedin-export.zip
"""
from __future__ import annotations

import argparse
import csv
import io
import sys
import zipfile
from pathlib import Path

from _lib import vault_path, write_md, make_filename, progress, today_iso


def read_csv(src: Path, basename: str) -> list[dict]:
    """Read a named CSV from a ZIP or directory."""
    if src.is_file() and src.suffix == '.zip':
        with zipfile.ZipFile(src) as z:
            for n in z.namelist():
                if n.endswith('/' + basename) or n == basename or n.endswith(basename):
                    with z.open(n) as f:
                        text = f.read().decode('utf-8', errors='replace')
                        return list(csv.DictReader(io.StringIO(text)))
    elif src.is_dir():
        for p in src.rglob(basename):
            return list(csv.DictReader(p.open(encoding='utf-8', errors='replace')))
    return []


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src', help='LinkedIn export .zip OR extracted folder')
    ap.add_argument('--vault', help='vault root override')
    ap.add_argument('--dest', default='08-LIBRARY/linkedin-saved', help='destination folder')
    args = ap.parse_args()

    src = Path(args.src)
    vault = vault_path(args.vault)
    out_dir = vault / args.dest
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f'Reading {src} …')
    saved_posts = read_csv(src, 'Saved Posts.csv')
    saved_articles = read_csv(src, 'Saved Articles.csv')

    items: list[dict] = []
    for row in saved_posts:
        url = row.get('Post Link') or row.get('PostLink') or row.get('URL') or ''
        if url:
            items.append({'url': url, 'date': row.get('Date Saved', today_iso()), 'type': 'post', 'author': row.get('Author', '')})
    for row in saved_articles:
        url = row.get('Article Link') or row.get('URL') or ''
        if url:
            items.append({'url': url, 'date': row.get('Date Saved', today_iso()), 'type': 'article', 'author': row.get('Author', '')})

    if not items:
        print('No saved posts/articles found. LinkedIn exports often omit saves entirely.')
        return

    print(f'Found {len(items)} items. Writing to {out_dir} …')
    for i, it in enumerate(items, 1):
        slug_stem = (it.get('author') or '') + '-' + it['url'].rstrip('/').split('/')[-1][:30]
        path = out_dir / make_filename(slug_stem.strip('-') or 'linkedin')
        body = f"[{it['url']}]({it['url']})\n\n*No content yet — LinkedIn doesn't allow fetching post bodies externally.*"
        write_md(path, {
            'url': it['url'],
            'source': 'linkedin',
            'type': it['type'],
            'author': it.get('author'),
            'saved_at': it['date'],
            'processed': False,
            'tags': ['linkedin', it['type']],
        }, body)
        if i % 25 == 0 or i == len(items):
            progress(i, len(items), it.get('author', ''))
    print(f'\n✓ Wrote {len(items)} files.')


if __name__ == '__main__':
    main()
