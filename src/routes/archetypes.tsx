import { createFileRoute } from '@tanstack/react-router';
import { LargeTitle, ListGroup, Row } from '@/ui/primitives';

export const Route = createFileRoute('/archetypes')({ component: Archetypes });

interface Arc { slug: string; the: string; name: string; jp: string; lvl: number; xp: number; xpMax: number; }
const ARCS: Arc[] = [
  { slug: 'executor', the: 'The', name: 'Executor', jp: '執行者', lvl: 47, xp: 16480, xpMax: 20000 },
  { slug: 'warrior',  the: 'The', name: 'Warrior',  jp: '戦士',   lvl: 38, xp: 8200,  xpMax: 12000 },
  { slug: 'creator',  the: 'The', name: 'Creator',  jp: '創造者', lvl: 29, xp: 4100,  xpMax: 7500  },
  { slug: 'maestro',  the: 'The', name: 'Maestro',  jp: '巨匠',   lvl: 23, xp: 2900,  xpMax: 4800  },
  { slug: 'leader',   the: 'The', name: 'Leader',   jp: '指導者', lvl: 19, xp: 1800,  xpMax: 3200  },
];

function Archetypes() {
  return (
    <div>
      <LargeTitle title="Archetypes" />
      <ListGroup>
        {ARCS.map(a => (
          <Row
            key={a.slug}
            leading={
              <div className="w-11 h-11 rounded-[10px] flex items-center justify-center"
                   style={{ background: 'var(--fill-tertiary)', color: 'var(--label)' }}>
                <span className="ios-headline font-mono">{a.name.slice(0, 2).toUpperCase()}</span>
              </div>
            }
            title={
              <div className="flex items-baseline gap-2">
                <span>{a.name}</span>
                <span className="ios-footnote font-mono" style={{ color: 'var(--label-tertiary)' }}>LVL {a.lvl}</span>
              </div>
            }
            subtitle={
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--fill-tertiary)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(a.xp / a.xpMax) * 100}%`, background: 'var(--tint)' }} />
                </div>
                <span className="ios-caption-1 font-mono" style={{ color: 'var(--label-secondary)' }}>{a.xp.toLocaleString()} / {a.xpMax.toLocaleString()}</span>
              </div>
            }
            chevron
            onClick={() => {}}
          />
        ))}
      </ListGroup>
    </div>
  );
}
