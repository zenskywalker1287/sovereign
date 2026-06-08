import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, Card, Button } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { watchAndSummarize, type WatchNote } from '@/domain/watch';

export const Route = createFileRoute('/watch')({ component: Watch });

function Watch() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<WatchNote | null>(null);

  async function submit() {
    setError(null); setNote(null); setLoading(true);
    try {
      const n = await watchAndSummarize(url.trim());
      setNote(n);
      setUrl('');
    } catch (e: any) {
      setError(e.message ?? 'Failed');
    } finally { setLoading(false); }
  }

  return (
    <div>
      <LargeTitle
        title="Watch"
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>Drop a YouTube link · Gemini watches it · structured note lands in vault</span>}
      />

      <section className="px-4 mb-4">
        <Card>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full bg-transparent ios-body outline-none font-mono"
            style={{ color: 'var(--label)' }}
          />
          <div className="flex items-center gap-3 mt-3">
            <div className="ios-footnote" style={{ color: 'var(--label-secondary)' }}>
              YouTube only · forces Gemini Flash
            </div>
            <div className="flex-1" />
            <Button variant="filled" onClick={submit}>
              {loading ? 'Watching…' : 'Watch'}
            </Button>
          </div>
        </Card>
      </section>

      {error && (
        <div className="mx-4 mb-4 p-4 rounded-[12px] ios-callout"
             style={{ background: 'color-mix(in srgb, var(--red) 12%, transparent)', color: 'var(--red)' }}>
          {error}
          {error.toLowerCase().includes('gemini key') && (
            <div className="mt-2"><Link to="/settings" className="ios-headline" style={{ color: 'var(--tint)' }}>Open Settings →</Link></div>
          )}
        </div>
      )}

      {note && (
        <div className="px-4 pb-12">
          <div className="ios-footnote uppercase tracking-wide mb-1" style={{ color: 'var(--label-secondary)' }}>Watched</div>
          <h2 className="ios-title-2 mb-2" style={{ color: 'var(--label)' }}>{note.title}</h2>
          <p className="ios-body italic mb-5" style={{ color: 'var(--label-secondary)' }}>{note.oneLineSummary}</p>

          <Section title="Key Takeaways">
            <ul className="space-y-2">
              {note.keyTakeaways.map((t, i) => (
                <li key={i} className="ios-body pl-4 relative" style={{ color: 'var(--label)' }}>
                  <span className="absolute left-0" style={{ color: 'var(--tint)' }}>•</span>{t}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Best Moments">
            <ul className="space-y-2">
              {note.bestMoments.map((m, i) => (
                <li key={i} className="ios-body" style={{ color: 'var(--label)' }}>
                  {m.timestamp && <span className="font-mono mr-2" style={{ color: 'var(--tint)' }}>{m.timestamp}</span>}
                  {m.note}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Apply To">
            <p className="ios-body" style={{ color: 'var(--label)' }}>{note.applyTo}</p>
          </Section>

          {note.savedPath && (
            <div className="mt-6 p-3 rounded-[10px] ios-footnote font-mono"
                 style={{ background: 'var(--tint-secondary)', color: 'var(--tint)' }}>
              ✓ Saved to vault: <span className="break-all">{note.savedPath}</span>
            </div>
          )}

          <div className="mt-6 ios-footnote">
            <a href={note.url} target="_blank" rel="noopener" className="ios-headline" style={{ color: 'var(--tint)' }}>
              Open video on YouTube →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <div className="ios-footnote uppercase tracking-wide mb-2" style={{ color: 'var(--label-secondary)' }}>{title}</div>
      {children}
    </section>
  );
}
