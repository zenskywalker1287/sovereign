import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { LargeTitle, ListGroup, Row, Segmented, Card } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { useStore } from '@/domain/store';

export const Route = createFileRoute('/missions')({ component: Missions });

type Tab = 'daily' | 'weekly' | 'arc';

function Missions() {
  const [tab, setTab] = useState<Tab>('daily');
  const missions = useStore(s => s.todayMissions());
  const checks = useStore(s => s.todayChecks());
  const toggleMission = useStore(s => s.toggleMission);

  const xpEarned = missions.filter(m => checks[m.id]).reduce((s, m) => s + m.xp, 0);
  const xpTotal  = missions.reduce((s, m) => s + m.xp, 0);
  const pct = xpTotal > 0 ? Math.round((xpEarned / xpTotal) * 100) : 0;

  return (
    <div>
      <LargeTitle title="Missions" />

      <div className="px-4 mb-4">
        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'daily',  label: 'Daily'  },
            { value: 'weekly', label: 'Weekly' },
            { value: 'arc',    label: 'Arc'    },
          ]}
        />
      </div>

      <div className="px-4 mb-4">
        <Card>
          <div className="flex items-end justify-between">
            <div>
              <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>XP Today</div>
              <div className="ios-title-1" style={{ color: 'var(--label)' }}>
                {xpEarned} <span className="ios-body" style={{ color: 'var(--label-secondary)' }}>/ {xpTotal}</span>
              </div>
            </div>
            <div className="ios-headline" style={{ color: 'var(--green)' }}>{pct}%</div>
          </div>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--fill-tertiary)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--green)' }} />
          </div>
        </Card>
      </div>

      {tab === 'daily' && (
        <ListGroup header="Today">
          {missions.map(m => {
            const done = !!checks[m.id];
            return (
              <Row
                key={m.id}
                leading={<Checkbox checked={done} onClick={() => toggleMission(m.id)} />}
                title={<span style={{ textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.55 : 1 }}>{m.title}</span>}
                subtitle={m.subtitle}
                trailing={<span className="ios-footnote font-mono" style={{ color: 'var(--label-secondary)' }}>+{m.xp} XP</span>}
              />
            );
          })}
        </ListGroup>
      )}

      {tab === 'weekly' && (
        <ListGroup header="This Week" footer="Weekly missions ship in P2.">
          <Row title="Coming soon" subtitle="Weekly XP targets + arcs" />
        </ListGroup>
      )}

      {tab === 'arc' && (
        <ListGroup header="Long-Term" footer="Arc missions ship in P2.">
          <Row title="Coming soon" subtitle="Multi-week arcs against the bootcamp authors" />
        </ListGroup>
      )}
    </div>
  );
}

function Checkbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all active:scale-90"
      style={{
        background: checked ? 'var(--green)' : 'transparent',
        border: checked ? 'none' : '1.5px solid var(--label-quaternary)',
      }}
    >
      {checked && <Icon name="check" size={14} className="text-white" />}
    </button>
  );
}
