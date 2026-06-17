import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { LargeTitle, Card, ListGroup, Row } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { DEFAULT_ARCHETYPES, getArchetype, type ArchetypeSlug } from '@/domain/archetypes';
import { useStore, selectLevelForXp, selectXpForLevel } from '@/domain/store';

export const Route = createFileRoute('/archetypes/$slug')({ component: ArchetypeDetail });

function ArchetypeDetail() {
  const { slug } = useParams({ from: '/archetypes/$slug' }) as { slug: ArchetypeSlug };
  const archetype = getArchetype(slug);
  const archetypeXp = useStore(s => s.archetypeXp);
  const xp = archetypeXp[slug] ?? 0;
  const { level, xpInLevel, xpToNext } = selectLevelForXp(xp);
  const xpToNextLevel = selectXpForLevel(level + 1) - selectXpForLevel(level);
  const pct = xpToNext > 0 ? (xpInLevel / xpToNextLevel) * 100 : 0;

  // Show all 5 archetypes' levels for comparison context
  const allLevels = DEFAULT_ARCHETYPES.map(a => ({
    ...a,
    xp: archetypeXp[a.slug] ?? 0,
    level: selectLevelForXp(archetypeXp[a.slug] ?? 0).level,
  }));
  const myRank = [...allLevels].sort((a, b) => b.level - a.level || b.xp - a.xp).findIndex(a => a.slug === slug) + 1;

  return (
    <div>
      <LargeTitle
        title={archetype.name}
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>{archetype.jp} · {archetype.oneLiner}</span>}
        trailing={<Link to="/archetypes" className="ios-headline" style={{ color: 'var(--tint)' }}>Done</Link>}
      />

      {/* Level + XP card */}
      <section className="px-4 mb-4">
        <Card>
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>Level</div>
              <div className="ios-large-title leading-none" style={{ color: 'var(--label)', fontSize: 64 }}>{level}</div>
            </div>
            <div className="text-right">
              <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>Rank</div>
              <div className="ios-title-2" style={{ color: 'var(--label)' }}>#{myRank}<span className="ios-body" style={{ color: 'var(--label-secondary)' }}> / 5</span></div>
            </div>
          </div>
          <div className="ios-footnote mb-1.5" style={{ color: 'var(--label-secondary)' }}>
            {xpInLevel.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP to Lvl {level + 1}
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--fill-tertiary)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--tint)' }} />
          </div>
          <div className="ios-caption-2 mt-2 font-mono" style={{ color: 'var(--label-tertiary)' }}>
            Lifetime XP: {xp.toLocaleString()}
          </div>
        </Card>
      </section>

      {/* Quote */}
      <section className="px-4 mb-4">
        <Card>
          <div className="ios-footnote uppercase tracking-wide mb-1" style={{ color: 'var(--label-secondary)' }}>Quote</div>
          <p className="ios-title-3 italic" style={{ color: 'var(--label)', fontFamily: 'var(--font-serif)' }}>
            "{archetype.quote}"
          </p>
        </Card>
      </section>

      {/* How to feed this archetype */}
      <ListGroup header="How XP flows here">
        <Row
          leading={<Mini name="pencil" color="var(--tint)" />}
          title={feederLabel(slug)}
          subtitle={feederWhere(slug)}
        />
        <Row
          leading={<Mini name="checklist" color="var(--green)" />}
          title="Daily missions"
          subtitle={missionForArchetype(slug)}
        />
      </ListGroup>

      {/* Compare to others */}
      <ListGroup header="All archetypes">
        {allLevels.sort((a, b) => b.level - a.level).map(a => (
          <Link key={a.slug} to="/archetypes/$slug" params={{ slug: a.slug }}>
            <Row
              leading={
                <div className="w-9 h-9 rounded-[8px] flex items-center justify-center"
                     style={{ background: a.slug === slug ? 'var(--tint)' : 'var(--fill-tertiary)', color: a.slug === slug ? 'white' : 'var(--label)' }}>
                  <span className="ios-headline font-mono">{a.name.slice(0, 2).toUpperCase()}</span>
                </div>
              }
              title={a.name}
              subtitle={`${a.xp.toLocaleString()} XP`}
              trailing={`LVL ${a.level}`}
              chevron={a.slug !== slug}
            />
          </Link>
        ))}
      </ListGroup>
    </div>
  );
}

function feederLabel(slug: ArchetypeSlug): string {
  return slug === 'creator'  ? 'Copywriting drills'
       : slug === 'maestro'  ? 'Fiction drills'
       : slug === 'leader'   ? 'Speech Gym drills'
       : slug === 'warrior'  ? 'Train the Body mission'
       : 'Freeform drills · Reflection mission';
}
function feederWhere(slug: ArchetypeSlug): string {
  return slug === 'creator'  ? 'Brain → Copy lane (Halbert)'
       : slug === 'maestro'  ? 'Brain → Fiction lane (Meyer)'
       : slug === 'leader'   ? 'Brain → Speech Gym'
       : slug === 'warrior'  ? 'Missions → Train the Body'
       : 'Brain → Freeform · Missions → Reflection';
}
function missionForArchetype(slug: ArchetypeSlug): string {
  return slug === 'creator'  ? 'Build the Brand'
       : slug === 'maestro'  ? 'Train the Mind'
       : slug === 'leader'   ? 'Control the Inner'
       : slug === 'warrior'  ? 'Train the Body'
       : 'Reflection';
}

function Mini({ name, color }: { name: any; color: string }) {
  return (
    <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ background: color, color: 'white' }}>
      <Icon name={name} size={16} />
    </div>
  );
}
