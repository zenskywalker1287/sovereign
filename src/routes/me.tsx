import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, Card, ListGroup, Row } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { useStore, selectLevelForXp } from '@/domain/store';
import { DEFAULT_ARCHETYPES } from '@/domain/archetypes';
import { lock } from '@/auth/passcode';

export const Route = createFileRoute('/me')({ component: Me });

/**
 * ME — identity + archetypes + settings shortcuts + lock.
 *
 * Replaces the old Profile tab AND folds the Archetypes tab in as a section.
 * Settings is one tap deep instead of two. Lock action is a prominent
 * destructive-style button at the bottom (was hidden in the top corner).
 */
function Me() {
  const profile = useStore(s => s.profile);
  const archetypeXp = useStore(s => s.archetypeXp);

  const archetypes = DEFAULT_ARCHETYPES.map(a => ({
    ...a,
    xp: archetypeXp[a.slug] ?? 0,
    level: selectLevelForXp(archetypeXp[a.slug] ?? 0).level,
  }));
  const totalLevel = archetypes.reduce((s, a) => s + a.level, 0);
  const topArchetypes = [...archetypes].sort((a, b) => b.level - a.level || b.xp - a.xp).slice(0, 3);

  return (
    <div>
      <LargeTitle title="Me" />

      {/* Identity card */}
      <section className="px-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
                 style={{ background: 'var(--fill-tertiary)' }}>
              <Icon name="circle-person" size={36} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="ios-title-2" style={{ color: 'var(--label)' }}>{profile.name}</div>
              <div className="ios-footnote" style={{ color: 'var(--label-secondary)' }}>
                Total Level {totalLevel} · since {profile.joinedAt}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Top 3 archetypes inline + see all */}
      <ListGroup header="Top archetypes">
        {topArchetypes.map(a => (
          <Link key={a.slug} to="/archetypes/$slug" params={{ slug: a.slug }}>
            <Row
              leading={
                <div className="w-10 h-10 rounded-[8px] flex items-center justify-center"
                     style={{ background: 'var(--fill-tertiary)', color: 'var(--label)' }}>
                  <span className="ios-headline font-mono">{a.name.slice(0, 2).toUpperCase()}</span>
                </div>
              }
              title={a.name}
              subtitle={a.oneLiner}
              trailing={`LVL ${a.level}`}
              chevron
            />
          </Link>
        ))}
        <Link to="/archetypes">
          <Row leading={<Mini icon="person-fill" color="var(--gray)" />} title="All archetypes" subtitle="5 total · ranked" chevron />
        </Link>
      </ListGroup>

      {/* Settings shortcuts — flat, no Profile burying */}
      <ListGroup header="Settings">
        <Link to="/settings">
          <Row leading={<Mini icon="gear" color="var(--gray)" />} title="API Keys" subtitle="OpenRouter · Gemini · OpenAI" chevron />
        </Link>
        <Link to="/settings" hash="appearance">
          <Row leading={<Mini icon="sparkles" color="var(--blue)" />} title="Appearance" subtitle="Light · Dark · System" chevron />
        </Link>
        <Link to="/settings" hash="notifications">
          <Row leading={<Mini icon="timer" color="var(--green)" />} title="Notifications" subtitle="Daily reminders" chevron />
        </Link>
      </ListGroup>

      {/* Lock — destructive style, easy to find */}
      <section className="px-4 mb-12">
        <button
          onClick={() => { lock(); location.reload(); }}
          className="w-full h-[50px] rounded-[12px] ios-headline active:opacity-70"
          style={{ background: 'var(--fill-tertiary)', color: 'var(--red)' }}
        >
          Lock app
        </button>
      </section>
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
