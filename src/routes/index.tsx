import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, Card, ListGroup, Row, Button } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { useStore, selectAuraPct, selectAuraLabel } from '@/domain/store';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  const profile = useStore(s => s.profile);
  const stats = useStore(s => s.stats);
  const auraPct = useStore(selectAuraPct);
  const auraLabel = selectAuraLabel(auraPct);

  const missions = useStore(s => s.todayMissions());
  const checks = useStore(s => s.todayChecks());
  const nextMission = missions.find(m => !checks[m.id]) ?? missions[0];
  const doneCount = missions.filter(m => checks[m.id]).length;

  const greeting = greetingFor(new Date().getHours());

  return (
    <div>
      <LargeTitle
        title={greeting}
        trailing={
          <Link to="/profile" aria-label="Profile">
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
                 style={{ background: 'var(--fill-tertiary)' }}>
              <Icon name="circle-person" size={22} />
            </div>
          </Link>
        }
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>{profile.name}</span>}
      />

      <section className="px-4 mb-4">
        <Card>
          <div className="ios-footnote uppercase tracking-wide mb-1" style={{ color: 'var(--label-secondary)' }}>
            Current Aura
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="ios-title-1" style={{ color: 'var(--label)' }}>{auraLabel}</div>
              <div className="ios-footnote mt-0.5" style={{ color: 'var(--label-secondary)' }}>
                {stats.currentStreak === 0 ? 'Start your streak today' : `${stats.currentStreak}-day streak`}
              </div>
            </div>
            <div className="text-right">
              <div className="ios-large-title leading-none" style={{ color: 'var(--tint)' }}>{auraPct}</div>
              <div className="ios-caption-2" style={{ color: 'var(--label-secondary)' }}>discipline</div>
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--fill-tertiary)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${auraPct}%`, background: 'var(--tint)' }} />
          </div>
        </Card>
      </section>

      <ListGroup header={`Today's Mission · ${doneCount} / ${missions.length}`}>
        <Link to="/missions"><Row
          leading={<IconBadge name={nextMission.icon as any} color={iconColor(nextMission.archetype)} />}
          title={nextMission.title}
          subtitle={`${nextMission.subtitle} · +${nextMission.xp} XP`}
          chevron
        /></Link>
      </ListGroup>

      <ListGroup header="Training">
        <Link to="/brain"><Row
          leading={<IconBadge name="pencil" color="var(--tint)" />}
          title="Writing Studio"
          subtitle="Fiction or copy · timed + graded"
          chevron
        /></Link>
        <Link to="/speech"><Row
          leading={<IconBadge name="sparkles" color="var(--orange)" />}
          title="Speech Gym"
          subtitle="Articulation · pace · vocabulary · cadence"
          chevron
        /></Link>
        <Link to="/brain/history"><Row
          leading={<IconBadge name="doc-text" color="var(--purple)" />}
          title="Graded History"
          subtitle={`${stats.drillsCompleted} drill${stats.drillsCompleted === 1 ? '' : 's'} completed`}
          chevron
        /></Link>
      </ListGroup>

      <ListGroup header="Mental Diet">
        <Link to="/diet"><Row
          leading={<IconBadge name="sparkles" color="var(--pink)" />}
          title="Today's diet"
          subtitle="Write · Study · Watch · Think"
          chevron
        /></Link>
        <Link to="/watch"><Row
          leading={<IconBadge name="sparkles" color="var(--teal)" />}
          title="Watch a video"
          subtitle="Drop a YouTube link → structured note"
          chevron
        /></Link>
      </ListGroup>

      <ListGroup header="Reflection">
        <Link to="/journal"><Row
          leading={<IconBadge name="pencil" color="var(--orange)" />}
          title="Today's journal"
          subtitle="What moved · what's blocked"
          chevron
        /></Link>
      </ListGroup>

      <div className="px-4 pb-2">
        <Link to="/surprise">
          <Button variant="tinted" fullWidth leading={<Icon name="sparkles" size={16} />}>
            Surprise Me
          </Button>
        </Link>
      </div>
    </div>
  );
}

function IconBadge({ name, color }: { name: any; color: string }) {
  return (
    <div className="w-7 h-7 rounded-[7px] flex items-center justify-center"
         style={{ background: color, color: 'white' }}>
      <Icon name={name} size={18} />
    </div>
  );
}
function iconColor(archetype: string) {
  return archetype === 'warrior' ? 'var(--red)'
    : archetype === 'maestro' ? 'var(--purple)'
    : archetype === 'creator' ? 'var(--pink)'
    : archetype === 'leader' ? 'var(--orange)'
    : 'var(--gray)';
}
function greetingFor(h: number) {
  if (h < 5)  return 'Late Night';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return 'Tonight';
}
