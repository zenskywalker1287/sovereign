import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { LargeTitle, ListGroup, Row, Card } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { listGraded } from '@/features/writing-studio/history';
import { useStore } from '@/domain/store';

export const Route = createFileRoute('/brain/')({ component: Train });

/**
 * TRAIN — the doing tab.
 * Pure practice entry point: pick a lane, run a drill, get graded.
 * No vault browsing here (that's the Mind tab).
 * Tab label in the bottom nav says "Train" even though URL is /brain (legacy).
 */
function Train() {
  const { data: graded } = useQuery({ queryKey: ['graded'], queryFn: listGraded });
  const stats = useStore(s => s.stats);
  const recentGrade = (graded ?? [])[0];

  return (
    <div>
      <LargeTitle
        title="Train"
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>Pick a lane. Write. Get graded.</span>}
      />

      {/* Writing Studio lanes — the big primary action */}
      <section className="px-4 mb-4">
        <Card>
          <div className="ios-footnote uppercase tracking-wide mb-3" style={{ color: 'var(--label-secondary)' }}>
            Writing Studio
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Lane lane="fiction"  emoji="✦" label="Fiction" hint="Meyer" />
            <Lane lane="copy"     emoji="◆" label="Copy"    hint="Halbert" />
            <Lane lane="freeform" emoji="●" label="Freeform" hint="Open" />
          </div>
        </Card>
      </section>

      {/* Speech Gym — second primary action */}
      <section className="px-4 mb-6">
        <Link to="/speech">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[11px] flex items-center justify-center"
                   style={{ background: 'var(--orange)', color: 'white' }}>
                <Icon name="sparkles" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>
                  Speech Gym
                </div>
                <div className="ios-headline" style={{ color: 'var(--label)' }}>Train articulate speech</div>
              </div>
              <Icon name="chevron-right" size={16} />
            </div>
          </Card>
        </Link>
      </section>

      {/* Bootcamps — read the note OR chat with the author */}
      <ListGroup header="Author bootcamps" footer="Read the bootcamp · or chat with the author for live coaching.">
        <Link to="/note/$" params={{ _splat: '01-CRAFT/writing/authors/gary-halbert.md' }}>
          <Row leading={<TileIcon name="flame" color="var(--red)" />}    title="Halbert — read"    subtitle="Copy bootcamp + signature rubric" chevron />
        </Link>
        <Link to="/chat/$persona" params={{ persona: 'halbert' }} search={{ name: undefined }}>
          <Row leading={<TileIcon name="brain" color="var(--red)" />}    title="Chat with Halbert" subtitle="Live coaching in his voice" chevron />
        </Link>
        <Link to="/note/$" params={{ _splat: '01-CRAFT/writing/authors/stephenie-meyer.md' }}>
          <Row leading={<TileIcon name="book" color="var(--purple)" />}  title="Meyer — read" subtitle="Fiction bootcamp + signature rubric" chevron />
        </Link>
        <Link to="/chat/$persona" params={{ persona: 'meyer' }} search={{ name: undefined }}>
          <Row leading={<TileIcon name="brain" color="var(--purple)" />} title="Chat with Meyer" subtitle="Live coaching on interiority + craft" chevron />
        </Link>
      </ListGroup>

      {/* Latest grade — single tile, "see all" leads to history */}
      <ListGroup header={`Last grade · ${stats.drillsCompleted} total`}>
        {recentGrade ? (
          <Link to="/note/$" params={{ _splat: recentGrade.path }}>
            <Row
              leading={
                <div className="w-10 h-10 rounded-[8px] flex flex-col items-center justify-center"
                     style={{ background: 'var(--tint)', color: 'white' }}>
                  <span className="ios-headline font-mono leading-none">{recentGrade.total}</span>
                  <span className="ios-caption-2 leading-none mt-0.5">/{recentGrade.max}</span>
                </div>
              }
              title={recentGrade.drill}
              subtitle={`${recentGrade.date} · ${recentGrade.lane}`}
              chevron
            />
          </Link>
        ) : (
          <Row title="No grades yet" subtitle="Submit a drill — score lands here" />
        )}
        <Link to="/brain/history">
          <Row leading={<TileIcon name="doc-text" color="var(--gray)" />} title="All grades" subtitle="Score history + sparkline" chevron />
        </Link>
      </ListGroup>
    </div>
  );
}

function Lane({ lane, emoji, label, hint }: { lane: 'fiction' | 'copy' | 'freeform'; emoji: string; label: string; hint: string }) {
  return (
    <Link to="/brain/studio/$lane" params={{ lane }}>
      <div className="rounded-[12px] py-4 flex flex-col items-center gap-1 active:scale-[0.97] transition-transform"
           style={{ background: 'var(--fill-tertiary)' }}>
        <div className="text-2xl leading-none" style={{ color: 'var(--label)' }}>{emoji}</div>
        <div className="ios-footnote font-semibold" style={{ color: 'var(--label)' }}>{label}</div>
        <div className="ios-caption-2" style={{ color: 'var(--label-secondary)' }}>{hint}</div>
      </div>
    </Link>
  );
}

function TileIcon({ name, color }: { name: any; color: string }) {
  return (
    <div className="w-9 h-9 rounded-[9px] flex items-center justify-center" style={{ background: color, color: 'white' }}>
      <Icon name={name} size={18} />
    </div>
  );
}
