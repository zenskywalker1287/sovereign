import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, ListGroup, Row, Card } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';

export const Route = createFileRoute('/profile')({ component: Profile });

function Profile() {
  return (
    <div>
      <LargeTitle title="Profile" />

      <section className="px-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
                 style={{ background: 'var(--fill-tertiary)' }}>
              <Icon name="circle-person" size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="ios-title-3" style={{ color: 'var(--label)' }}>Zatreides</div>
              <div className="ios-footnote" style={{ color: 'var(--label-secondary)' }}>Total Level 156 · since Apr 2026</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--separator)' }}>
            <Stat label="Total XP"      value="33.5k" />
            <Stat label="Streak"        value="12d"   />
            <Stat label="Drills"        value="47"    />
            <Stat label="Words"         value="92k"   />
          </div>
        </Card>
      </section>

      <ListGroup header="Journal">
        <Row leading={<Badge color="var(--orange)" icon="flame" />}    title="Today" subtitle="Tap to write" chevron onClick={() => {}} />
        <Row leading={<Badge color="var(--gray)"   icon="doc-text" />} title="Past Entries" subtitle="34 entries" chevron onClick={() => {}} />
      </ListGroup>

      <ListGroup header="Voltage Log">
        <Row title="Today's average" trailing="7.8" />
        <Row title="View 7-day chart" chevron onClick={() => {}} />
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
