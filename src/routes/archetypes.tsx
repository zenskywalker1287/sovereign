import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, ListGroup, Row, Card } from '@/ui/primitives';
import { useStore, selectLevelForXp } from '@/domain/store';
import { DEFAULT_ARCHETYPES } from '@/domain/archetypes';

export const Route = createFileRoute('/archetypes')({ component: Archetypes });

function Archetypes() {
  const archetypeXp = useStore(s => s.archetypeXp);
  const ranked = [...DEFAULT_ARCHETYPES]
    .map(a => ({ ...a, xp: archetypeXp[a.slug] ?? 0, ...selectLevelForXp(archetypeXp[a.slug] ?? 0) }))
    .sort((a, b) => b.level - a.level || b.xpInLevel - a.xpInLevel);
  const totalLevel = ranked.reduce((s, a) => s + a.level, 0);

  return (
    <div>
      <LargeTitle title="Archetypes" />

      <section className="px-4 mb-4">
        <Card>
          <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>Total Level</div>
          <div className="ios-large-title leading-none mt-0.5" style={{ color: 'var(--label)' }}>{totalLevel}</div>
          <div className="ios-footnote mt-1" style={{ color: 'var(--label-secondary)' }}>
            Sum of all archetype levels. Bumps when any one of them levels up.
          </div>
        </Card>
      </section>

      <ListGroup>
        {ranked.map(a => (
          <Link key={a.slug} to="/archetypes/$slug" params={{ slug: a.slug }}>
            <Row
              leading={
                <div className="w-11 h-11 rounded-[10px] flex items-center justify-center"
                     style={{ background: 'var(--fill-tertiary)', color: 'var(--label)' }}>
                  <span className="ios-headline font-mono">{a.name.slice(0, 2).toUpperCase()}</span>
                </div>
              }
              title={
                <div className="flex items-baseline gap-2">
                  <span>{a.name}</span>
                  <span className="ios-footnote font-mono" style={{ color: 'var(--label-tertiary)' }}>LVL {a.level}</span>
                </div>
              }
              subtitle={
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--fill-tertiary)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(a.xpInLevel / a.xpToNext) * 100}%`, background: 'var(--tint)' }} />
                  </div>
                  <span className="ios-caption-1 font-mono" style={{ color: 'var(--label-secondary)' }}>
                    {a.xpInLevel.toLocaleString()} / {a.xpToNext.toLocaleString()}
                  </span>
                </div>
              }
              chevron
            />
          </Link>
        ))}
      </ListGroup>

      <div className="px-4 ios-footnote" style={{ color: 'var(--label-secondary)' }}>
        XP is awarded automatically when you complete drills + missions. Copy → Creator · Fiction → Maestro · Freeform → Executor.
      </div>
    </div>
  );
}
