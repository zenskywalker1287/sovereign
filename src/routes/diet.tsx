import { useEffect, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, Card, Button, ListGroup, Row } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { generateDiet, getCachedDiet, type MentalDiet } from '@/domain/mental-diet';
import { MissingKeyError } from '@/domain/llm';

export const Route = createFileRoute('/diet')({ component: Diet });

function Diet() {
  const [diet, setDiet] = useState<MentalDiet | null>(() => getCachedDiet());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true); setError(null);
    try {
      const d = await generateDiet();
      setDiet(d);
    } catch (e: any) {
      if (e instanceof MissingKeyError) {
        setError(`Set your ${e.provider === 'gemini' ? 'Gemini' : 'OpenRouter'} key in Profile → Settings first.`);
      } else {
        setError(e.message ?? 'Generation failed');
      }
    } finally { setLoading(false); }
  }

  // Auto-generate first time on this date if no cache
  useEffect(() => { if (!diet) generate(); /* eslint-disable-next-line */ }, []);

  if (!diet) {
    return (
      <div>
        <LargeTitle title="Mental Diet" subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>Write · Study · Watch · Think</span>} />
        <div className="px-4 py-12 text-center">
          {error ? (
            <>
              <div className="ios-headline" style={{ color: 'var(--red)' }}>{error}</div>
              {error.includes('key') && (
                <div className="mt-3"><Link to="/settings" className="ios-headline" style={{ color: 'var(--tint)' }}>Open Settings →</Link></div>
              )}
            </>
          ) : (
            <>
              <div className="ios-headline" style={{ color: 'var(--label)' }}>{loading ? 'Generating today\'s diet…' : 'Tap to generate'}</div>
              <div className="mt-4">
                <Button variant="filled" onClick={generate}>{loading ? '…' : 'Generate'}</Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <LargeTitle
        title="Mental Diet"
        trailing={
          <button onClick={generate} disabled={loading} className="ios-headline" style={{ color: 'var(--tint)' }}>
            {loading ? '…' : 'Re-roll'}
          </button>
        }
        subtitle={<span className="ios-subheadline italic" style={{ color: 'var(--label-secondary)' }}>{diet.throughLine}</span>}
      />

      <Slot color="var(--pink)" icon="pencil" title="Write" sub={`${diet.write.format} · ${diet.write.minutes} min`}>
        <div className="ios-headline mb-2" style={{ color: 'var(--label)' }}>{diet.write.title}</div>
        <p className="ios-body" style={{ color: 'var(--label)' }}>{diet.write.prompt}</p>
        <p className="ios-footnote mt-2 italic" style={{ color: 'var(--label-secondary)' }}>Connect: {diet.write.connect}</p>
      </Slot>

      <Slot color="var(--indigo)" icon="book" title="Study" sub="Deep-read suggestion">
        <div className="ios-headline mb-2" style={{ color: 'var(--label)' }}>{diet.study.suggestion}</div>
        <p className="ios-body" style={{ color: 'var(--label-secondary)' }}>{diet.study.angle}</p>
      </Slot>

      <Slot color="var(--teal)" icon="sparkles" title="Watch" sub="Direction, not a URL">
        <div className="ios-headline mb-2" style={{ color: 'var(--label)' }}>{diet.watch.creatorType}</div>
        <p className="ios-body" style={{ color: 'var(--label-secondary)' }}>{diet.watch.lens}</p>
        <div className="mt-3">
          <Link to="/watch" className="ios-headline" style={{ color: 'var(--tint)' }}>
            Have a video? Watch & summarize →
          </Link>
        </div>
      </Slot>

      <Slot color="var(--green)" icon="brain" title="Think" sub="One synthesis question">
        <p className="ios-title-3" style={{ color: 'var(--label)' }}>{diet.think}</p>
      </Slot>

      <div className="px-4 ios-footnote pb-2" style={{ color: 'var(--label-secondary)' }}>
        Saved to vault at <code>00-INBOX/mental-diet/{diet.date}.md</code>
      </div>
    </div>
  );
}

function Slot({ color, icon, title, sub, children }:
  { color: string; icon: any; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="px-4 mb-4">
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-[7px] flex items-center justify-center" style={{ background: color, color: 'white' }}>
            <Icon name={icon} size={16} />
          </div>
          <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>{title}</div>
          <div className="flex-1" />
          <div className="ios-caption-2" style={{ color: 'var(--label-tertiary)' }}>{sub}</div>
        </div>
        {children}
      </Card>
    </section>
  );
}
