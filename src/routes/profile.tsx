import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, ListGroup, Row, Card } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { useStore, selectLevelForXp } from '@/domain/store';
import { DEFAULT_ARCHETYPES } from '@/domain/archetypes';
import { lock } from '@/auth/passcode';

export const Route = createFileRoute('/profile')({ component: Profile });

function fmtNum(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10_000 ? 0 : 1) + 'k';
  return String(n);
}

function Profile() {
  const profile = useStore(s => s.profile);
  const stats = useStore(s => s.stats);
  const archetypeXp = useStore(s => s.archetypeXp);
  const totalLevel = DEFAULT_ARCHETYPES.reduce((s, a) => s + selectLevelForXp(archetypeXp[a.slug] ?? 0).level, 0);

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
        <Row leading={<Badge color="var(--orange)" icon="flame" />}    title="Today" subtitle="Tap to write" chevron onClick={() => {}} />
        <Row leading={<Badge color="var(--gray)"   icon="doc-text" />} title="Past Entries" subtitle="Coming in P2" chevron onClick={() => {}} />
      </ListGroup>

      <ListGroup header="Voltage Log">
        <Row title="Longest streak" trailing={`${stats.longestStreak}d`} />
        <Row title="View 7-day chart" subtitle="Coming in P2" chevron onClick={() => {}} />
      </ListGroup>

      <ListGroup header="Settings">
        <Link to="/settings"><Row leading={<Badge color="var(--gray)" icon="gear" />} title="API Keys + Models" subtitle="OpenRouter / Gemini · model picker" chevron /></Link>
        <Row leading={<Badge color="var(--blue)" icon="sparkles" />} title="Appearance"    subtitle="Match system"             chevron onClick={() => {}} />
        <Row leading={<Badge color="var(--green)" icon="timer"   />} title="Notifications" subtitle="Off"                      chevron onClick={() => {}} />
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
