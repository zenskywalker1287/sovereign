import { useEffect, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { LargeTitle, Card, ListGroup, Row } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { useStore } from '@/domain/store';
import { listGraded } from '@/features/writing-studio/history';
import { getVault } from '@/vault/adapter';

export const Route = createFileRoute('/library')({ component: Library });

/**
 * LIBRARY — the museum.
 *
 * Everything you've made: graded drills, journal entries, voltage log, streak.
 * Pure "look back" surface. The making happens on Today + Train; this is where
 * you review your trail.
 */
function Library() {
  const stats = useStore(s => s.stats);
  const voltageLog = useStore(s => s.voltageLog);
  const { data: graded } = useQuery({ queryKey: ['graded'], queryFn: listGraded });

  // Past journals via vault adapter
  const [journals, setJournals] = useState<{ path: string; date: string }[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const vault = await getVault();
        const list = await vault.list('00-INBOX/journal/');
        setJournals(
          list
            .filter(p => p.endsWith('.md'))
            .map(p => ({ path: p, date: p.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? '' }))
            .sort((a, b) => (a.date < b.date ? 1 : -1))
            .slice(0, 5)
        );
      } catch {}
    })();
  }, []);

  // Voltage spark from last ~30 entries
  const voltSparkData = voltageLog.slice(0, 30).reverse().map(v => v.voltage / 10);
  const recentGrades = (graded ?? []).slice(0, 5);
  const avgScore = recentGrades.length
    ? Math.round(recentGrades.reduce((s, g) => s + (g.total / g.max), 0) / recentGrades.length * 100)
    : 0;

  return (
    <div>
      <LargeTitle
        title="Library"
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>Everything you've made</span>}
      />

      {/* Lifetime stats */}
      <section className="px-4 mb-6">
        <Card>
          <div className="grid grid-cols-4 gap-3">
            <Stat label="Total XP"        value={fmtNum(stats.lifetimeXp)} />
            <Stat label="Streak"          value={`${stats.currentStreak}d`} />
            <Stat label="Drills"          value={String(stats.drillsCompleted)} />
            <Stat label="Longest"         value={`${stats.longestStreak}d`} />
          </div>
        </Card>
      </section>

      {/* Recent grades */}
      <ListGroup
        header={`Recent grades · avg ${recentGrades.length ? avgScore + '%' : '—'}`}
      >
        {recentGrades.length === 0 ? (
          <Row title="No grades yet" subtitle="Run a drill on the Train tab" />
        ) : (
          recentGrades.map(e => (
            <Link key={e.path} to="/note/$" params={{ _splat: e.path }}>
              <Row
                leading={
                  <div className="w-10 h-10 rounded-[8px] flex flex-col items-center justify-center"
                       style={{ background: scoreBg(e.total, e.max), color: 'white' }}>
                    <span className="ios-headline font-mono leading-none">{e.total}</span>
                    <span className="ios-caption-2 leading-none mt-0.5">/{e.max}</span>
                  </div>
                }
                title={e.drill}
                subtitle={`${e.date} · ${e.lane}`}
                chevron
              />
            </Link>
          ))
        )}
        <Link to="/brain/history">
          <Row leading={<Mini icon="doc-text" color="var(--gray)" />} title="All grades" subtitle="Sparkline + every entry" chevron />
        </Link>
      </ListGroup>

      {/* Recent journal entries */}
      <ListGroup header="Recent journals">
        <Link to="/journal">
          <Row leading={<Mini icon="pencil" color="var(--orange)" />} title="Today's entry" subtitle="Open + write" chevron />
        </Link>
        {journals.length === 0 ? (
          <Row title="No past entries" subtitle="Write today's first" />
        ) : (
          journals.map(j => (
            <Link key={j.path} to="/note/$" params={{ _splat: j.path }}>
              <Row title={j.date} subtitle="Journal" chevron />
            </Link>
          ))
        )}
        <Link to="/folder/$" params={{ _splat: '00-INBOX/journal' }}>
          <Row leading={<Mini icon="doc-text" color="var(--gray)" />} title="All journals" chevron />
        </Link>
      </ListGroup>

      {/* Voltage chart */}
      <section className="px-4 mb-6">
        <div className="ios-footnote uppercase tracking-wide mb-2 px-1" style={{ color: 'var(--label-secondary)' }}>
          Voltage
        </div>
        <Card>
          {voltSparkData.length === 0 ? (
            <div className="ios-body" style={{ color: 'var(--label-secondary)' }}>
              No voltage data yet. Drills and missions log voltage automatically.
            </div>
          ) : (
            <Sparkline values={voltSparkData} />
          )}
        </Card>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="ios-title-3" style={{ color: 'var(--label)' }}>{value}</div>
      <div className="ios-caption-2 mt-0.5" style={{ color: 'var(--label-secondary)' }}>{label}</div>
    </div>
  );
}
function Mini({ icon, color }: { icon: any; color: string }) {
  return (
    <div className="w-7 h-7 rounded-[7px] flex items-center justify-center" style={{ background: color, color: 'white' }}>
      <Icon name={icon} size={16} />
    </div>
  );
}
function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const W = 320, H = 50, pad = 4;
  const xs = values.length === 1 ? [W / 2] : values.map((_, i) => pad + (i / (values.length - 1)) * (W - pad * 2));
  const ys = values.map(v => H - pad - Math.max(0, Math.min(1, v)) * (H - pad * 2));
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ color: 'var(--tint)' }} />
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
function fmtNum(n: number) {
  if (n >= 10_000) return Math.floor(n / 1000) + 'k';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}
