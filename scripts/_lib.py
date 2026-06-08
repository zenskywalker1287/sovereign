"""Shared helpers used by every import / transcribe script."""
from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

try:
    from slugify import slugify  # python-slugify
except ImportError:
    def slugify(s: str) -> str:
        return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

DEFAULT_VAULT = Path.home() / 'Library' / 'Mobile Documents' / 'iCloud~md~obsidian' / 'Documents' / 'SOVEREIGN'

def vault_path(override: str | None = None) -> Path:
    p = Path(override) if override else DEFAULT_VAULT
    if not p.exists():
        sys.exit(f'Vault not found at {p}. Pass --vault PATH.')
    return p

def write_md(path: Path, frontmatter: dict, body: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = ['---']
    for k, v in frontmatter.items():
        if v is None or v == '':
            continue
        if isinstance(v, list):
            lines.append(f'{k}:')
            for item in v:
                lines.append(f'  - {item}')
        else:
            # quote strings containing colons/special chars
            s = str(v)
            if ':' in s or '#' in s or s.startswith(('-', '@')):
                s = json.dumps(s, ensure_ascii=False)
            lines.append(f'{k}: {s}')
    lines.append('---')
    lines.append('')
    lines.append(body.rstrip())
    path.write_text('\n'.join(lines) + '\n', encoding='utf-8')

def today_iso() -> str:
    return datetime.now().strftime('%Y-%m-%d')

def make_filename(stem: str, ext: str = 'md', max_len: int = 80) -> str:
    safe = slugify(stem)[:max_len].strip('-') or 'untitled'
    return f'{safe}.{ext}'

def progress(i: int, total: int, label: str = '') -> None:
    pct = (i / total * 100) if total else 0
    msg = f'\r[{i}/{total}] {pct:5.1f}% {label[:50]}'
    sys.stderr.write(msg.ljust(80))
    sys.stderr.flush()
    if i == total:
        sys.stderr.write('\n')
