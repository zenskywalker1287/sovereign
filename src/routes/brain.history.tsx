import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { LargeTitle, ListGroup, Row, Card } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { listGraded } from '@/features/writing-studio/history';

export const Route = createFileRoute('/brain/history')({ component: HistoryView });

function HistoryView() {
  const { data, isLoading } = useQuery({ queryKey: ['graded'], queryFn: listGraded });
  const entries = data ?? [];

  // Build a tiny sparkline series of total/max as percentage 0..1
  const series = [...entries]
    .reverse()
    .map(e => e.total / e.max);

  const best = entries.reduce((a, b) => (b.total / b.max > (a?.total ?? 0) / (a?.max ?? 60) ? b : a), entries[0]);
  const avgPct = series.length
    ? Math.round((series.reduce((s, v) => s + v, 0) / series.length) * 100)
    : 0;

  return (
    <div>
      <LargeTitle
        title="Graded"
        trailing={<Link to="/brain" className="ios-headline" style={{ color: 'var(--tint)' }}>Done</Link>}
      />

      {entries.length > 0 && (
        <section className="px-4 mb-4">
          <Card>
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>Average</div>
                <div className="ios-title-1" style={{ color: 'var(--label)' }}>{avgPct}%</div>
              </div>
              <div className="text-right">
                <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>Best</div>
                <div className="ios-headline" style={{ color: 'var(--label)' }}>{best ? `${best.total}/${best.max}` : '—'}</div>
                <div className="ios-caption-2" style={{ color: 'var(--label-tertiary)' }}>{best?.drill}</div>
              </div>
            </div>
            <Sparkline values={series} />
          </Card>
        </section>
      )}

      {isLoading && (
        <div className="px-4 py-6 ios-body" style={{ color: 'var(--label-secondary)' }}>Loading…</div>
      )}

      {!isLoading && entries.length === 0 && (
        <div className="px-4 py-12 text-center">
          <div className="ios-headline" style={{ color: 'var(--label)' }}>No graded work yet</div>
          <div className="ios-footnote mt-1" style={{ color: 'var(--label-secondary)' }}>
            Pick a drill and submit it — it'll show up here.
          </div>
          <div className="mt-4">
            <Link to="/brain" className="ios-headline" style={{ color: 'var(--tint)' }}>Open Brain →</Link>
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <ListGroup>
          {entries.map(e => (
            <Row
              key={e.path}
              leading={
                <div className="w-10 h-10 rounded-[8px] flex flex-col items-center justify-center"
                     style={{ background: scoreBg(e.total, e.max), color: 'white' }}>
                  <span className="ios-headline font-mono leading-none">{e.total}</span>
                  <span className="ios-caption-2 leading-none mt-0.5">/{e.max}</span>
                </div>
              }
              title={e.drill}
              subtitle={`${e.date} · ${e.lane}${e.signatureName ? ` · ${e.signatureName}` : ''}`}
              chevron
              onClick={() => {}}
            />
          ))}
        </ListGroup>
      )}
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const W = 320, H = 50, pad = 4;
  const xs = values.length === 1 ? [W / 2] : values.map((_, i) => pad + (i / (values.length - 1)) * (W - pad * 2));
  const ys = values.map(v => H - pad - v * (H - pad * 2));
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ color: 'var(--tint)' }} />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="2.5" fill="currentColor" style={{ color: 'var(--tint)' }} />
      ))}
    </svg>
  );
}

function scoreBg(score: number, max: number) {
  const pct = score / max;
  if (pct >= 0.9) return 'var(--green)';
  if (pct >= 0.75) return 'var(--tint)';
  if (pct >= 0.5) return 'var(--orange)';
  return 'var(--red)';
}
