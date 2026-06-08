import { useEffect, useState } from 'react';
import { createFileRoute, useParams, Link } from '@tanstack/react-router';
import { LargeTitle, Card } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { getVault } from '@/vault/adapter';
import { marked } from 'marked';
import matter from 'gray-matter';

// $ catch-all route — captures any path under /note/, like /note/01-CRAFT/cold-email.md
export const Route = createFileRoute('/note/$')({ component: NoteReader });

function NoteReader() {
  const { _splat } = useParams({ from: '/note/$' }) as { _splat: string };
  const path = decodeURIComponent(_splat ?? '');
  const [body, setBody] = useState<string | null>(null);
  const [front, setFront] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const vault = await getVault();
        if (!(await vault.exists(path))) { setError(`Note not found: ${path}`); return; }
        const raw = await vault.read(path);
        const parsed = matter(raw);
        setFront(parsed.data);
        // Rewrite [[wikilinks]] to internal /note/ routes; very lightweight resolver
        // that searches for an exact name match in the loaded vault listing.
        const rewritten = await rewriteWikilinks(parsed.content);
        setBody(await marked.parse(rewritten));
      } catch (e: any) {
        setError(e.message ?? 'Could not read note');
      }
    })();
  }, [path]);

  return (
    <div>
      <LargeTitle
        title={String(front?.title ?? path.split('/').pop()?.replace('.md', '') ?? 'Note')}
        trailing={<Link to="/brain" className="ios-headline" style={{ color: 'var(--tint)' }}>Done</Link>}
        subtitle={<span className="ios-footnote font-mono" style={{ color: 'var(--label-secondary)' }}>{path}</span>}
      />

      {error && (
        <div className="mx-4 mb-4 p-4 rounded-[12px] ios-callout"
             style={{ background: 'color-mix(in srgb, var(--red) 12%, transparent)', color: 'var(--red)' }}>
          {error}
        </div>
      )}

      {body && (
        <article className="px-5 pb-12 prose-mobile" style={{ color: 'var(--label)' }}>
          <div dangerouslySetInnerHTML={{ __html: body }} />
        </article>
      )}

      <style>{`
        .prose-mobile h1, .prose-mobile h2, .prose-mobile h3 { color: var(--label); margin-top: 1.5em; margin-bottom: .4em; font-weight: 700; letter-spacing: -.015em; }
        .prose-mobile h1 { font-size: 28px; line-height: 34px; }
        .prose-mobile h2 { font-size: 22px; line-height: 28px; }
        .prose-mobile h3 { font-size: 20px; line-height: 25px; }
        .prose-mobile p, .prose-mobile li { font-size: 17px; line-height: 1.55; color: var(--label); }
        .prose-mobile ul, .prose-mobile ol { padding-left: 1.5em; margin: .6em 0; }
        .prose-mobile a { color: var(--tint); text-decoration: none; }
        .prose-mobile code { background: var(--fill-tertiary); padding: 2px 6px; border-radius: 6px; font-size: 15px; }
        .prose-mobile pre { background: var(--surface-elevated); padding: 12px 16px; border-radius: 10px; overflow-x: auto; }
        .prose-mobile blockquote { border-left: 3px solid var(--tint); padding-left: 14px; margin: 1em 0; color: var(--label-secondary); font-style: italic; }
        .prose-mobile hr { border: none; border-top: 0.5px solid var(--separator); margin: 1.5em 0; }
        .prose-mobile table { border-collapse: collapse; margin: 1em 0; }
        .prose-mobile th, .prose-mobile td { border: 0.5px solid var(--separator); padding: 6px 10px; }
      `}</style>
    </div>
  );
}

async function rewriteWikilinks(md: string): Promise<string> {
  const vault = await getVault();
  // Lazy: only scan the common folders
  const candidates = [
    ...await safeList(vault, '01-CRAFT/'),
    ...await safeList(vault, '02-MIND/'),
    ...await safeList(vault, '08-LIBRARY/'),
  ];
  const byName: Record<string, string> = {};
  for (const p of candidates) {
    const name = p.split('/').pop()!.replace('.md', '').toLowerCase();
    byName[name] = p;
  }
  return md.replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (_full, link: string, _pipe: string, label?: string) => {
    const key = link.trim().toLowerCase();
    const path = byName[key];
    const visible = label?.trim() ?? link.trim();
    if (path) return `[${visible}](/note/${encodeURIComponent(path)})`;
    return `[${visible}](#unresolved)`;
  });
}
async function safeList(vault: any, folder: string): Promise<string[]> {
  try { return (await vault.list(folder)).filter((p: string) => p.endsWith('.md')); }
  catch { return []; }
}
