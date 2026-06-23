import { useEffect, useRef, useState } from 'react';
import { createFileRoute, Link, useParams, useNavigate } from '@tanstack/react-router';
import { LargeTitle, Card, Button } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { getChallenge } from '@/domain/courses';
import { useStore } from '@/domain/store';

export const Route = createFileRoute('/brain/challenge/$courseId/$challengeId')({ component: ChallengePage });

/**
 * One challenge — depending on type, renders:
 *   drill     → timed editor + "Mark done" + auto-XP
 *   read      → link to /note/$path (the bootcamp / framework note)
 *   chat      → link to /chat/$persona
 *   monologue → link to /speech/monologue with hint
 *
 * Marking done writes to challengeProgress so the course page lights it green
 * and the course progress bar fills.
 */
function ChallengePage() {
  const { courseId, challengeId } = useParams({ from: '/brain/challenge/$courseId/$challengeId' });
  const navigate = useNavigate();
  const completeChallenge = useStore(s => s.completeChallenge);
  const challengeProgress = useStore(s => s.challengeProgress);

  const ctx = getChallenge(courseId, challengeId);
  if (!ctx) {
    return (
      <div className="p-6">
        <div className="ios-body">Challenge not found.</div>
        <Link to="/brain" className="ios-headline" style={{ color: 'var(--tint)' }}>Back to Ascension</Link>
      </div>
    );
  }
  const { course, set, challenge } = ctx;
  const previouslyDone = !!challengeProgress[challenge.id];

  return (
    <div className="pb-12">
      <header className="safe-top px-4 pt-3 pb-2 flex items-center justify-between">
        <Link
          to={course.domain === 'speech' ? '/brain/speech-course' : course.domain === 'copy' ? '/brain/copy' : '/brain/fiction'}
          className="ios-body"
          style={{ color: 'var(--tint)' }}
        >
          <Icon name="chevron-left" size={16} /> {course.name.split(':')[0]}
        </Link>
        <div className="ios-headline" style={{ color: 'var(--label)' }}>
          {set.emoji} Module {set.number}
        </div>
        <div className="w-12" />
      </header>

      <LargeTitle
        title={challenge.title}
        subtitle={
          <span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>
            Challenge {challenge.number} · +{challenge.xp} XP · {challenge.minutes} min
          </span>
        }
      />

      {previouslyDone && (
        <section className="px-4 mb-4">
          <div className="rounded-[10px] px-3 py-2 ios-footnote inline-flex items-center gap-2"
               style={{ background: 'color-mix(in srgb, var(--green) 18%, transparent)', color: 'var(--green)' }}>
            <Icon name="check" size={14} /> Completed {challengeProgress[challenge.id]!.count}× · last on {challengeProgress[challenge.id]!.lastAt}
          </div>
        </section>
      )}

      {/* Brief */}
      <section className="px-4 mb-4">
        <Card>
          <p className="ios-body" style={{ color: 'var(--label)' }}>{challenge.body}</p>
        </Card>
      </section>

      {/* Type-specific body */}
      {challenge.type === 'drill' && challenge.drill && (
        <DrillRunner
          challenge={challenge}
          onDone={() => {
            completeChallenge(challenge.id, challenge.xp, challenge.archetype);
            setTimeout(() => navigate({ to: course.domain === 'speech' ? '/brain/speech-course' : course.domain === 'copy' ? '/brain/copy' : '/brain/fiction' }), 700);
          }}
        />
      )}

      {challenge.type === 'read' && challenge.notePath && (
        <section className="px-4 mb-4 space-y-3">
          <Link to="/note/$" params={{ _splat: challenge.notePath }}>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[9px] flex items-center justify-center"
                     style={{ background: 'var(--purple)', color: 'white' }}>
                  <Icon name="book" size={20} />
                </div>
                <div className="flex-1">
                  <div className="ios-headline" style={{ color: 'var(--label)' }}>Open the note</div>
                  <div className="ios-footnote" style={{ color: 'var(--label-secondary)' }}>{challenge.notePath}</div>
                </div>
                <Icon name="chevron-right" size={16} />
              </div>
            </Card>
          </Link>
          <Button
            variant="filled"
            fullWidth
            size="lg"
            onClick={() => {
              completeChallenge(challenge.id, challenge.xp, challenge.archetype);
              navigate({ to: course.domain === 'speech' ? '/brain/speech-course' : course.domain === 'copy' ? '/brain/copy' : '/brain/fiction' });
            }}
          >
            Mark read · +{challenge.xp} XP
          </Button>
        </section>
      )}

      {challenge.type === 'chat' && challenge.personaKey && (
        <section className="px-4 mb-4 space-y-3">
          <Link to="/chat/$persona" params={{ persona: challenge.personaKey }} search={{ name: undefined }}>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[9px] flex items-center justify-center"
                     style={{ background: 'var(--tint)', color: 'white' }}>
                  <Icon name="brain" size={20} />
                </div>
                <div className="flex-1">
                  <div className="ios-headline" style={{ color: 'var(--label)' }}>Open chat</div>
                  <div className="ios-footnote" style={{ color: 'var(--label-secondary)' }}>Persona: {challenge.personaKey}</div>
                </div>
                <Icon name="chevron-right" size={16} />
              </div>
            </Card>
          </Link>
          <Button
            variant="filled"
            fullWidth
            size="lg"
            onClick={() => {
              completeChallenge(challenge.id, challenge.xp, challenge.archetype);
              navigate({ to: course.domain === 'speech' ? '/brain/speech-course' : course.domain === 'copy' ? '/brain/copy' : '/brain/fiction' });
            }}
          >
            Mark done · +{challenge.xp} XP
          </Button>
        </section>
      )}

      {challenge.type === 'monologue' && (
        <section className="px-4 mb-4 space-y-3">
          <Link to="/speech/monologue">
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[9px] flex items-center justify-center"
                     style={{ background: 'var(--orange)', color: 'white' }}>
                  <Icon name="sparkles" size={20} />
                </div>
                <div className="flex-1">
                  <div className="ios-headline" style={{ color: 'var(--label)' }}>Open Monologue generator</div>
                  <div className="ios-footnote" style={{ color: 'var(--label-secondary)' }}>Use this challenge's context</div>
                </div>
                <Icon name="chevron-right" size={16} />
              </div>
            </Card>
          </Link>
          <Button
            variant="filled"
            fullWidth
            size="lg"
            onClick={() => {
              completeChallenge(challenge.id, challenge.xp, challenge.archetype);
              navigate({ to: course.domain === 'speech' ? '/brain/speech-course' : course.domain === 'copy' ? '/brain/copy' : '/brain/fiction' });
            }}
          >
            Mark performed · +{challenge.xp} XP
          </Button>
        </section>
      )}
    </div>
  );
}

/* ─── Drill runner — inline timed editor specific to challenges ─── */

function DrillRunner({ challenge, onDone }: { challenge: { drill?: { technique: string; prompt: string }; minutes: number; xp: number }; onDone: () => void }) {
  const [seconds, setSeconds] = useState(challenge.minutes * 60);
  const [running, setRunning] = useState(false);
  const [text, setText] = useState('');
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { if (tickRef.current) clearInterval(tickRef.current); setRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  if (!challenge.drill) return null;

  return (
    <>
      {/* Timer + start/pause */}
      <section className="px-4 mb-4">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>Timer</div>
              <div className="ios-large-title font-mono leading-none tabular-nums" style={{ color: seconds < 30 ? 'var(--red)' : 'var(--label)' }}>{mm}:{ss}</div>
            </div>
            <button
              onClick={() => setRunning(r => !r)}
              className="h-[44px] px-5 rounded-[12px] ios-headline"
              style={{ background: running ? 'var(--fill)' : 'var(--tint)', color: running ? 'var(--label)' : 'white' }}
            >
              {running ? 'Pause' : seconds === challenge.minutes * 60 ? 'Start' : 'Resume'}
            </button>
          </div>
        </Card>
      </section>

      {/* Technique */}
      <section className="px-4 mb-4">
        <div className="rounded-[12px] p-4" style={{ background: 'var(--tint-secondary)' }}>
          <div className="ios-caption-1 uppercase tracking-wide mb-1" style={{ color: 'var(--tint)' }}>Technique</div>
          <p className="ios-body" style={{ color: 'var(--label)' }}>{challenge.drill.technique}</p>
        </div>
      </section>

      {/* Prompt */}
      <section className="px-4 mb-4">
        <div className="ios-footnote uppercase tracking-wide mb-2 px-1" style={{ color: 'var(--label-secondary)' }}>Prompt</div>
        <Card>
          <p className="ios-body whitespace-pre-line" style={{ color: 'var(--label)', fontSize: 17, lineHeight: 1.55 }}>{challenge.drill.prompt}</p>
        </Card>
      </section>

      {/* Editor */}
      <section className="px-4 mb-4">
        <div className="ios-footnote uppercase tracking-wide mb-2 px-1" style={{ color: 'var(--label-secondary)' }}>Write here</div>
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); if (!running && seconds === challenge.minutes * 60) setRunning(true); }}
          placeholder="Start typing — the timer starts automatically"
          className="w-full p-4 rounded-[14px] outline-none resize-none ios-body"
          style={{
            background: 'var(--bg-grouped-secondary)',
            color: 'var(--label)',
            minHeight: 240,
            fontFamily: 'var(--font-serif)',
            fontSize: 17,
            lineHeight: 1.55,
          }}
        />
      </section>

      {/* Done */}
      <section className="px-4">
        <Button variant="filled" size="lg" fullWidth onClick={onDone}>
          Mark done · +{challenge.xp} XP
        </Button>
      </section>
    </>
  );
}
