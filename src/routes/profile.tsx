import { useEffect, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, ListGroup, Row, Card } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { useStore, selectLevelForXp } from '@/domain/store';
import { DEFAULT_ARCHETYPES } from '@/domain/archetypes';
import { lock } from '@/auth/passcode';
import { getVault } from '@/vault/adapter';

export const Route = createFileRoute('/profile')({ component: Profile });

function fmtNum(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10_000 ? 0 : 1) + 'k';
  return String(n);
}

function Profile() {
  const profile = useStore(s => s.profile);
  const stats = useStore(s => s.stats);
  const archetypeXp = useStore(s => s.archetypeXp);
  const voltageLog = useStore(s => s.voltageLog);
  const totalLevel = DEFAULT_ARCHETYPES.reduce(
    (s, a) => s + selectLevelForXp(archetypeXp[a.slug] ?? 0).level,
    0
  );

  // Past journal entries — read from vault
  const [pastEntries, setPastEntries] = useState<{ path: string; date: string }[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const vault = await getVault();
        const list = await vault.list('00-INBOX/journal/');
        const entries = list
          .filter(p => p.endsWith('.md'))
          .map(p => ({ path: p, date: p.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? '' }))
          .sort((a, b) => (a.date < b.date ? 1 : -1));
        setPastEntries(entries);
      } catch { /* folder doesn't exist yet, fine */ }
    })();
  }, []);

  // Voltage spark line — last 30 entries
  const recentVoltage = voltageLog.slice(0, 30).reverse();

  return (
    <div>
      <LargeTitle
        title="Profile"
        trailing={
          <button
            onClick={() => { lock(); location.reload(); }}
            className="ios-headline"
            style={{ color: 'var(--tint)' }}
          >
            Lock
          </button>
        }
      />

      <section className="px-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
                 style={{ background: 'var(--fill-tertiary)' }}>
              <Icon name="circle-person" size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="ios-title-3" style={{ color: 'var(--label)' }}>{profile.name}</div>
              <div className="ios-footnote" style={{ color: 'var(--label-secondary)' }}>
                Total Level {totalLevel} · since {profile.joinedAt}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--separator)' }}>
            <Stat label="Total XP"   value={fmtNum(stats.lifetimeXp)} />
            <Stat label="Streak"     value={`${stats.currentStreak}d`} />
            <Stat label="Drills"     value={String(stats.drillsCompleted)} />
            <Stat label="Words"      value={fmtNum(stats.wordsWritten)} />
          </div>
        </Card>
      </section>

      <ListGroup header="Journal">
        <Link to="/journal"><Row leading={<Badge color="var(--orange)" icon="pencil" />} title="Today" subtitle="Tap to write" chevron /></Link>
        {pastEntries.length === 0 ? (
          <Row leading={<Badge color="var(--gray)" icon="doc-text" />} title="Past entries" subtitle="No entries yet" />
        ) : (
          <Link to="/folder/$" params={{ _splat: '00-INBOX/journal' }}>
            <Row leading={<Badge color="var(--gray)" icon="doc-text" />} title="Past entries" subtitle={`${pastEntries.length} ${pastEntries.length === 1 ? 'entry' : 'entries'} · most recent ${pastEntries[0].date}`} chevron />
          </Link>
        )}
      </ListGroup>

      <ListGroup header="Voltage Log">
        <Row title="Longest streak" trailing={`${stats.longestStreak}d`} />
        <Row title="Total drills"   trailing={String(stats.drillsCompleted)} />
        {recentVoltage.length === 0 ? (
          <Row title="No voltage data yet" subtitle="Voltage logs when you complete drills + missions" />
        ) : (
          <div className="px-4 py-3">
            <div className="ios-footnote mb-2" style={{ color: 'var(--label-secondary)' }}>Last {recentVoltage.length} entries</div>
            <Sparkline values={recentVoltage.map(v => v.voltage / 10)} />
          </div>
        )}
      </ListGroup>

      <ListGroup header="Settings">
        <Link to="/settings"><Row leading={<Badge color="var(--gray)" icon="gear" />} title="API Keys + Models" subtitle="OpenRouter / Gemini / OpenAI" chevron /></Link>
        <Link to="/settings" hash="appearance"><Row leading={<Badge color="var(--blue)" icon="sparkles" />} title="Appearance" subtitle="Light / Dark / System" chevron /></Link>
        <Link to="/settings" hash="notifications"><Row leading={<Badge color="var(--green)" icon="timer" />} title="Notifications" subtitle="Daily mission reminders" chevron /></Link>
      </ListGroup>
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

function Badge({ color, icon }: { color: string; icon: any }) {
  return (
    <div className="w-7 h-7 rounded-[7px] flex items-center justify-center" style={{ background: color, color: 'white' }}>
      <Icon name={icon} size={16} />
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const W = 320, H = 40, pad = 4;
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
