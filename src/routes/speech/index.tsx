import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, ListGroup, Row, Card } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { SPEECH_DRILLS, SKILL_LABELS, type SpeechSkill } from '@/domain/speech-drills';

export const Route = createFileRoute('/speech/')({ component: Speech });

function Speech() {
  // Group drills by skill, render each skill as a section
  const bySkill = SPEECH_DRILLS.reduce((acc, d) => {
    (acc[d.skill] ||= []).push(d);
    return acc;
  }, {} as Record<SpeechSkill, typeof SPEECH_DRILLS>);

  // Today's pick: deterministic from date so it doesn't reroll on re-render
  const today = new Date().toISOString().slice(0, 10);
  const seed = [...today].reduce((s, c) => s + c.charCodeAt(0), 0);
  const todays = SPEECH_DRILLS[seed % SPEECH_DRILLS.length];

  return (
    <div>
      <LargeTitle
        title="Speech Gym"
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>Articulate speech · 7 Rules · 3×5 Diet</span>}
      />

      <section className="px-4 mb-6">
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

      {(Object.keys(SKILL_LABELS) as SpeechSkill[]).map(skill => (
        bySkill[skill]?.length ? (
          <ListGroup key={skill} header={SKILL_LABELS[skill]}>
            {bySkill[skill].map(d => (
              <Link key={d.id} to="/speech/drill/$id" params={{ id: d.id }}>
                <Row
                  leading={
                    <div className="w-9 h-9 rounded-[9px] flex items-center justify-center"
                         style={{ background: 'var(--fill-tertiary)' }}>
                      <Icon name="timer" size={18} />
                    </div>
                  }
                  title={d.title}
                  subtitle={`${d.minutes} min · ${d.technique.split('.')[0]}`}
                  chevron
                />
              </Link>
            ))}
          </ListGroup>
        ) : null
      ))}

      <div className="px-4 ios-footnote pb-4" style={{ color: 'var(--label-secondary)' }}>
        Completing a drill awards XP to the <strong>Leader</strong> archetype (presence + command of room) and bumps your streak.
      </div>
    </div>
  );
}
