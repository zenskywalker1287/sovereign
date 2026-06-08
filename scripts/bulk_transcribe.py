#!/usr/bin/env python3
"""
Bulk-transcribe every URL-stub note in a vault folder.

Reads frontmatter for `url` + `processed`. If processed is False, calls
transcribe_url.py and inlines the transcript into the note body, then flips
processed: true. Skips items where processed is already true.

Disk discipline: temp audio files are deleted after each transcription.
Rate-limit safety: sleeps between calls.

Usage:
    python bulk_transcribe.py 08-LIBRARY/instagram-saves
    python bulk_transcribe.py 08-LIBRARY/youtube-liked --max 10
    python bulk_transcribe.py 08-LIBRARY/twitter-bookmarks --sleep 2
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
import time
from pathlib import Path

from _lib import vault_path


SCRIPT_DIR = Path(__file__).parent


def read_frontmatter(text: str) -> tuple[dict, str]:
    """Cheap YAML frontmatter parser. We only need flat key: value."""
    if not text.startswith('---'):
        return {}, text
    end = text.find('---', 3)
    if end == -1:
        return {}, text
    fm_text = text[3:end].strip()
    body = text[end + 3:].lstrip('\n')
    data: dict = {}
    for line in fm_text.splitlines():
        line = line.rstrip()
        if not line or line.startswith('  -') or line.startswith(' '):
            continue
        m = re.match(r'^([^:]+):\s*(.*)$', line)
        if not m:
            continue
        k, v = m.group(1).strip(), m.group(2).strip()
        if v.lower() in ('true', 'false'):
            data[k] = v.lower() == 'true'
        elif v.startswith('"') and v.endswith('"'):
            data[k] = v[1:-1]
        else:
            data[k] = v
    return data, body


def write_back(path: Path, fm: dict, body: str) -> None:
    """Write the note back with updated frontmatter."""
    lines = ['---']
    for k, v in fm.items():
        if isinstance(v, bool):
            lines.append(f'{k}: {"true" if v else "false"}')
        elif isinstance(v, list):
            lines.append(f'{k}:')
            for item in v:
                lines.append(f'  - {item}')
        elif v is None or v == '':
            continue
        else:
            s = str(v)
            if ':' in s and not s.startswith('"'):
                s = f'"{s}"'
            lines.append(f'{k}: {s}')
    lines.append('---')
    lines.append('')
    lines.append(body.rstrip())
    path.write_text('\n'.join(lines) + '\n', encoding='utf-8')


def transcribe(url: str) -> str | None:
    """Shell out to transcribe_url.py --print-only."""
    cmd = [sys.executable, str(SCRIPT_DIR / 'transcribe_url.py'), url, '--print-only']
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    except Exception as e:
        print(f'  ! subprocess error: {e}', file=sys.stderr)
        return None
    if result.returncode != 0:
        print(f'  ! transcribe failed: {result.stderr.strip()[:200]}', file=sys.stderr)
        return None
    return result.stdout.strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('folder', help='vault-relative folder (e.g. 08-LIBRARY/instagram-saves)')
    ap.add_argument('--vault', help='vault root override')
    ap.add_argument('--max', type=int, help='cap for testing')
    ap.add_argument('--sleep', type=float, default=1.0, help='seconds between requests')
    ap.add_argument('--retry-failed', action='store_true', help='retry notes marked processed=false even if previously failed')
    args = ap.parse_args()

    vault = vault_path(args.vault)
    target = vault / args.folder
    if not target.exists():
        sys.exit(f'No such folder: {target}')

    md_files = sorted(target.glob('*.md'))
    pending = []
    for p in md_files:
        text = p.read_text(encoding='utf-8', errors='replace')
        fm, body = read_frontmatter(text)
        if fm.get('processed'):
            continue
        if not fm.get('url'):
            continue
        pending.append((p, fm, body))

    if args.max:
        pending = pending[: args.max]

    if not pending:
        print('Nothing to process.')
        return

    print(f'Bulk-transcribing {len(pending)} URLs from {target} …')
    success = 0
    fail = 0
    for i, (p, fm, body) in enumerate(pending, 1):
        url = fm['url']
        sys.stderr.write(f'\n[{i}/{len(pending)}] {url}\n')
        transcript = transcribe(url)
        if not transcript:
            fail += 1
            time.sleep(args.sleep)
            continue
        success += 1
        new_body = f'{body.rstrip()}\n\n## Transcript\n\n{transcript[:200_000]}\n'
        fm['processed'] = True
        fm['transcribed_at'] = time.strftime('%Y-%m-%d %H:%M')
        write_back(p, fm, new_body)
        time.sleep(args.sleep)

    print(f'\n✓ Transcribed {success}/{len(pending)} (failed: {fail})')


if __name__ == '__main__':
    main()
