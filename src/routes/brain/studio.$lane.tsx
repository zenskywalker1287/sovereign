import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { LargeTitle, ListGroup, Row } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { drillsByLane, type Lane } from '@/domain/drills';

export const Route = createFileRoute('/brain/studio/$lane')({ component: Studio });

const LANE_META: Record<Lane, { title: string; subtitle: string }> = {
  fiction:  { title: 'Fiction',  subtitle: 'Interiority, restraint, body-first emotion' },
  copy:     { title: 'Copy',     subtitle: 'Halbert, Hopkins, Carlton, Ogilvy' },
  freeform: { title: 'Freeform', subtitle: 'Morning pages and open-ended writing' },
};

function Studio() {
  const { lane } = useParams({ from: '/brain/studio/$lane' }) as { lane: Lane };
  const meta = LANE_META[lane];
  const drills = drillsByLane(lane);
  return (
    <div>
      <LargeTitle
        title={meta?.title ?? 'Studio'}
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>{meta?.subtitle}</span>}
        trailing={
          <Link to="/brain" className="ios-headline" style={{ color: 'var(--tint)' }}>Done</Link>
        }
      />
      <ListGroup header="Pick a Drill">
        {drills.map(d => (
          <Link key={d.id} to="/brain/drill/$id" params={{ id: d.id }}>
            <Row
              leading={
                <div className="w-9 h-9 rounded-[9px] flex items-center justify-center"
                     style={{ background: 'var(--fill-tertiary)' }}>
                  <Icon name="timer" size={18} />
                </div>
              }
              title={d.title}
              subtitle={`${d.minutes} min · ${d.skill}${d.author ? ' · ' + d.author : ''}`}
              chevron
            />
          </Link>
        ))}
      </ListGroup>
    </div>
  );
}
