import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { LargeTitle, ListGroup, Row, Segmented, Card } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';

export const Route = createFileRoute('/missions')({ component: Missions });

type Tab = 'daily' | 'weekly' | 'arc';

const SEED: Record<Tab, Mission[]> = {
  daily: [
    { id: 'body',    title: 'Train the Body',     sub: 'Workout · 45 min', xp: 75, done: true },
    { id: 'mind',    title: 'Train the Mind',     sub: 'Read 20 pages',    xp: 40, done: true },
    { id: 'brand',   title: 'Build the Brand',    sub: 'Work on content',  xp: 90, done: true },
    { id: 'inner',   title: 'Control the Inner',  sub: 'Meditate 15 min',  xp: 30, done: true },
    { id: 'reflect', title: 'Reflection',         sub: 'Journal your day', xp: 25, done: false },
  ],
  weekly: [
    { id: 'wk-1', title: 'Ship 5 Drills',       sub: '3 of 5 completed', xp: 200, done: false },
    { id: 'wk-2', title: '3 Cold Email Sends',  sub: '1 of 3 completed', xp: 150, done: false },
  ],
  arc: [
    { id: 'arc-1', title: 'Halbert Bootcamp',    sub: 'Lvl 1 → Lvl 5',  xp: 1500, done: false },
    { id: 'arc-2', title: 'Meyer Interiority',   sub: 'Lvl 2 → Lvl 6',  xp: 1500, done: false },
  ],
};
interface Mission { id: string; title: string; sub: string; xp: number; done: boolean; }

function Missions() {
  const [tab, setTab] = useState<Tab>('daily');
  const [items, setItems] = useState<Record<Tab, Mission[]>>(SEED);

  const list = items[tab];
  const xpEarned = list.filter(m => m.done).reduce((s, m) => s + m.xp, 0);
  const xpTotal  = list.reduce((s, m) => s + m.xp, 0);

  const toggle = (id: string) => {
    setItems(prev => ({
      ...prev,
      [tab]: prev[tab].map(m => m.id === id ? { ...m, done: !m.done } : m),
    }));
  };

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
              <div className="ios-title-1" style={{ color: 'var(--label)' }}>{xpEarned} <span className="ios-body" style={{ color: 'var(--label-secondary)' }}>/ {xpTotal}</span></div>
            </div>
            <div className="ios-headline" style={{ color: 'var(--green)' }}>{Math.round((xpEarned / xpTotal) * 100)}%</div>
          </div>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--fill-tertiary)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${(xpEarned / xpTotal) * 100}%`, background: 'var(--green)' }} />
          </div>
        </Card>
      </div>

      <ListGroup header={tab === 'daily' ? "Today" : tab === 'weekly' ? "This Week" : "Long-Term"}>
        {list.map(m => (
          <Row
            key={m.id}
            leading={<Checkbox checked={m.done} onClick={() => toggle(m.id)} />}
            title={<span style={{ textDecoration: m.done ? 'line-through' : 'none', opacity: m.done ? 0.55 : 1 }}>{m.title}</span>}
            subtitle={m.sub}
            trailing={<span className="ios-footnote font-mono" style={{ color: 'var(--label-secondary)' }}>+{m.xp} XP</span>}
          />
        ))}
      </ListGroup>
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
