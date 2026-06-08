import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, Card, ListGroup, Row, Button } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  // v1 hardcoded mocks; wired to vault in week 2
  const greeting = greetingFor(new Date().getHours());
  const auraPct = 87;
  const auraState = 'Locked In';
  const streak = 12;

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
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>Zatreides</span>}
      />

      {/* Aura card */}
      <section className="px-4 mb-4">
        <Card>
          <div className="ios-footnote uppercase tracking-wide mb-1" style={{ color: 'var(--label-secondary)' }}>
            Current Aura
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="ios-title-1" style={{ color: 'var(--label)' }}>{auraState}</div>
              <div className="ios-footnote mt-0.5" style={{ color: 'var(--label-secondary)' }}>
                {streak}-day streak
              </div>
            </div>
            <div className="text-right">
              <div className="ios-large-title leading-none" style={{ color: 'var(--tint)' }}>{auraPct}</div>
              <div className="ios-caption-2" style={{ color: 'var(--label-secondary)' }}>discipline</div>
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--fill-tertiary)' }}>
            <div className="h-full rounded-full" style={{ width: `${auraPct}%`, background: 'var(--tint)' }} />
          </div>
        </Card>
      </section>

      {/* Today's Mission */}
      <ListGroup header="Today's Mission">
        <Row
          leading={<IconBadge name="flame" color="var(--orange)" />}
          title="Train the Body"
          subtitle="Workout · 45 min · +75 XP"
          chevron
          onClick={() => {}}
        />
      </ListGroup>

      {/* Writing Studio quick-access */}
      <ListGroup header="Writing Studio">
        <Link to="/brain"><Row
          leading={<IconBadge name="pencil" color="var(--tint)" />}
          title="Start a Drill"
          subtitle="Fiction or copywriting · 10 min"
          chevron
        /></Link>
        <Link to="/brain"><Row
          leading={<IconBadge name="doc-text" color="var(--purple)" />}
          title="Graded History"
          subtitle="See score over time"
          chevron
        /></Link>
      </ListGroup>

      {/* Mental Diet */}
      <ListGroup header="Mental Diet" footer="Run /mental-diet to refresh">
        <Row leading={<IconBadge name="pencil" color="var(--pink)" />}    title="Write" subtitle="Tap to generate today's prompt" chevron onClick={() => {}} />
        <Row leading={<IconBadge name="book" color="var(--indigo)" />}    title="Study" subtitle="Tap to pick today's note"     chevron onClick={() => {}} />
        <Row leading={<IconBadge name="sparkles" color="var(--teal)" />}  title="Watch" subtitle="Drop a YouTube link"          chevron onClick={() => {}} />
        <Row leading={<IconBadge name="brain" color="var(--green)" />}    title="Think" subtitle="The synthesis question"      chevron onClick={() => {}} />
      </ListGroup>

      <div className="px-4 pb-2">
        <Button variant="tinted" fullWidth leading={<Icon name="sparkles" size={16} />}>
          Surprise Me
        </Button>
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

function greetingFor(h: number) {
  if (h < 5)  return 'Late Night';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return 'Tonight';
}
