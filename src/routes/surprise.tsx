import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, Card, Button } from '@/ui/primitives';
import { generateSurprise, type Surprise } from '@/domain/surprise';
import { MissingKeyError } from '@/domain/llm';

export const Route = createFileRoute('/surprise')({ component: SurprisePage });

function SurprisePage() {
  const [result, setResult] = useState<Surprise | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setError(null); setLoading(true); setResult(null);
    try {
      const s = await generateSurprise();
      setResult(s);
    } catch (e: any) {
      if (e instanceof MissingKeyError) setError(`Set your ${e.provider} key in Profile → Settings.`);
      else setError(e.message ?? 'Failed');
    } finally { setLoading(false); }
  }

  return (
    <div>
      <LargeTitle
        title="Surprise Me"
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>Picks random items from your vault · finds the non-obvious link</span>}
        trailing={
          <button onClick={go} disabled={loading} className="ios-headline" style={{ color: 'var(--tint)' }}>
            {loading ? '…' : result ? 'Again' : 'Surprise'}
          </button>
        }
      />

      {!result && !loading && !error && (
        <div className="px-4 py-12 text-center">
          <div className="ios-headline mb-4" style={{ color: 'var(--label)' }}>Pull 3 items from across your work?</div>
          <Button variant="filled" onClick={go}>Surprise me</Button>
        </div>
      )}

      {loading && (
        <div className="px-4 py-12 text-center ios-body" style={{ color: 'var(--label-secondary)' }}>
          Pulling items from the vault · finding the unobvious thread…
        </div>
      )}

      {error && (
        <div className="mx-4 p-4 rounded-[12px] ios-callout"
             style={{ background: 'color-mix(in srgb, var(--red) 12%, transparent)', color: 'var(--red)' }}>
          {error}
          {error.includes('Settings') && (
            <div className="mt-2"><Link to="/settings" className="ios-headline" style={{ color: 'var(--tint)' }}>Open Settings →</Link></div>
          )}
        </div>
      )}

      {result && (
        <div className="px-4 pb-12">
          {result.items.length > 0 && (
            <section className="mb-5">
              <div className="ios-footnote uppercase tracking-wide mb-2" style={{ color: 'var(--label-secondary)' }}>Three items</div>
              <Card>
                <ol className="space-y-2">
                  {result.items.map((it, i) => (
                    <li key={it.path} className="ios-body" style={{ color: 'var(--label)' }}>
                      <span className="font-mono mr-2" style={{ color: 'var(--tint)' }}>{i + 1}.</span>
                      {it.title}
                      <div className="ios-caption-2 ml-5" style={{ color: 'var(--label-tertiary)' }}>{it.folder}</div>
                    </li>
                  ))}
                </ol>
              </Card>
            </section>
          )}

          <section className="mb-5">
            <div className="ios-footnote uppercase tracking-wide mb-2" style={{ color: 'var(--label-secondary)' }}>The connection</div>
            <p className="ios-body whitespace-pre-line" style={{ color: 'var(--label)' }}>{result.connection}</p>
          </section>

          <section className="mb-2">
            <div className="ios-footnote uppercase tracking-wide mb-2" style={{ color: 'var(--label-secondary)' }}>One concrete prompt</div>
            <Card>
              <p className="ios-title-3" style={{ color: 'var(--label)' }}>{result.prompt}</p>
            </Card>
          </section>
        </div>
      )}
    </div>
  );
}
