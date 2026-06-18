import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, ListGroup, Row, Card } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { SPEECH_DRILLS, SKILL_LABELS, type SpeechSkill } from '@/domain/speech-drills';
import { useStore } from '@/domain/store';

export const Route = createFileRoute('/speech/')({ component: SpeechHome });

function SpeechHome() {
  const speechProgress = useStore(s => s.speechProgress);
  const totalDone = Object.values(speechProgress).reduce((s, n) => s + n, 0);

  // Today's pick (deterministic by date)
  const today = new Date().toISOString().slice(0, 10);
  const seed = [...today].reduce((s, c) => s + c.charCodeAt(0), 0);
  const todays = SPEECH_DRILLS[seed % SPEECH_DRILLS.length];

  // Group drills by skill
  const bySkill = SPEECH_DRILLS.reduce((acc, d) => {
    (acc[d.skill] ||= []).push(d);
    return acc;
  }, {} as Record<SpeechSkill, typeof SPEECH_DRILLS>);

  return (
    <div className="pb-12">
      <LargeTitle
        title="Speech Gym"
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>Articulate speech · 7 Rules · 3 problems</span>}
      />

      {/* TODAY'S PICK — hero card */}
      <section className="px-4 mb-4">
        <Card>
          <div className="ios-footnote uppercase tracking-wide mb-1" style={{ color: 'var(--label-secondary)' }}>Today's Pick</div>
          <div className="ios-title-2" style={{ color: 'var(--label)' }}>{todays.title}</div>
          <div className="ios-footnote mt-1" style={{ color: 'var(--label-secondary)' }}>
            {SKILL_LABELS[todays.skill]} · {todays.minutes} min
          </div>
          <p className="ios-body mt-3" style={{ color: 'var(--label)' }}>{todays.technique}</p>
          <div className="mt-4">
            <Link
              to="/speech/drill/$id"
              params={{ id: todays.id }}
              className="inline-flex items-center h-[44px] px-5 rounded-[12px] ios-headline active:opacity-70 no-select"
              style={{ background: 'var(--tint)', color: 'white' }}
            >
              Start →
            </Link>
          </div>
        </Card>
      </section>

      {/* AI SECTIONS */}
      <ListGroup header="AI training">
        <Link to="/speech/monologue">
          <Row
            leading={<Tile color="var(--purple)" icon="sparkles" />}
            title="Monologues"
            subtitle="Pick a scene · AI writes it · practice with timer"
            chevron
          />
        </Link>
        <Link to="/chat/$persona" params={{ persona: 'speech-coach' }} search={{ name: undefined }}>
          <Row
            leading={<Tile color="var(--tint)" icon="brain" />}
            title="Talk to your coach"
            subtitle="7-Rules-trained chat · diagnose + drill"
            chevron
          />
        </Link>
      </ListGroup>

      {/* REFERENCE */}
      <ListGroup header="The framework">
        <Link to="/speech/rules">
          <Row
            leading={<Tile color="var(--blue)" icon="book" />}
            title="The 7 Rules of Articulacy"
            subtitle="The foundation · one per day to rotate"
            chevron
          />
        </Link>
        <Link to="/speech/problems">
          <Row
            leading={<Tile color="var(--red)" icon="flame" />}
            title="The 3 Core Problems"
            subtitle="Diagnose what's killing your articulation"
            chevron
          />
        </Link>
      </ListGroup>

      {/* DRILLS by skill */}
      {(Object.keys(SKILL_LABELS) as SpeechSkill[]).map(skill => (
        bySkill[skill]?.length ? (
          <ListGroup key={skill} header={SKILL_LABELS[skill]}>
            {bySkill[skill].map(d => {
              const doneCount = speechProgress[d.id] ?? 0;
              return (
                <Link key={d.id} to="/speech/drill/$id" params={{ id: d.id }}>
                  <Row
                    leading={
                      <div className="w-9 h-9 rounded-[9px] flex items-center justify-center"
                           style={{ background: doneCount > 0 ? 'var(--green)' : 'var(--fill-tertiary)', color: doneCount > 0 ? 'white' : 'var(--label)' }}>
                        {doneCount > 0 ? <span className="ios-headline font-mono">{doneCount}</span> : <Icon name="timer" size={18} />}
                      </div>
                    }
                    title={d.title}
                    subtitle={`${d.minutes} min · ${d.technique.split('.')[0]}`}
                    chevron
                  />
                </Link>
              );
            })}
          </ListGroup>
        ) : null
      ))}

      <div className="px-4 ios-footnote" style={{ color: 'var(--label-secondary)' }}>
        {totalDone === 0 ? "No drills done yet — start with today's pick." : `${totalDone} drill${totalDone === 1 ? '' : 's'} completed · XP flows to Leader.`}
      </div>
    </div>
  );
}

function Tile({ color, icon }: { color: string; icon: any }) {
  return (
    <div className="w-9 h-9 rounded-[9px] flex items-center justify-center" style={{ background: color, color: 'white' }}>
      <Icon name={icon} size={18} />
    </div>
  );
}
