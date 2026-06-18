import { useEffect, useRef, useState } from 'react';
import { createFileRoute, Link, useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { speechDrillById, SKILL_LABELS } from '@/domain/speech-drills';
import { useStore } from '@/domain/store';

export const Route = createFileRoute('/speech/drill/$id')({ component: SpeechDrillView });

function SpeechDrillView() {
  const { id } = useParams({ from: '/speech/drill/$id' });
  const drill = speechDrillById(id);
  const navigate = useNavigate();
  const completeSpeechDrill = useStore(s => s.completeSpeechDrill);

  const [seconds, setSeconds] = useState((drill?.minutes ?? 5) * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [notes, setNotes] = useState('');
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          if (tickRef.current) clearInterval(tickRef.current);
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [running]);

  if (!drill) {
    return (
      <div className="p-6">
        <div className="ios-body">Drill not found.</div>
        <div className="mt-3"><Link to="/speech" className="ios-headline" style={{ color: 'var(--tint)' }}>Back to Speech Gym</Link></div>
      </div>
    );
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const totalSecs = drill.minutes * 60;
  const progressPct = ((totalSecs - seconds) / totalSecs) * 100;

  function complete() {
    // Speech drills award 50 XP to Leader + log per-drill completion for stats.
    completeSpeechDrill(drill!.id, 50);
    setDone(true);
    setTimeout(() => navigate({ to: '/speech' }), 800);
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <div className="nav-bar-blur safe-top px-4 py-2 flex items-center justify-between sticky top-0 z-10">
        <Link to="/speech" className="ios-body flex items-center gap-1" style={{ color: 'var(--tint)' }}>
          <Icon name="chevron-left" size={16} /> Gym
        </Link>
        <div className="ios-headline font-mono tabular-nums" style={{ color: seconds < 30 ? 'var(--red)' : 'var(--label)' }}>
          {mm}:{ss}
        </div>
        <button onClick={() => setRunning(r => !r)} className="ios-body" style={{ color: 'var(--tint)' }}>
          {running ? 'Pause' : seconds === totalSecs ? 'Start' : 'Resume'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full" style={{ background: 'var(--fill-tertiary)' }}>
        <div className="h-full transition-all" style={{ width: `${progressPct}%`, background: 'var(--tint)' }} />
      </div>

      <div className="px-5 pt-5 flex-1">
        <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>
          {SKILL_LABELS[drill.skill]} · {drill.minutes} min
        </div>
        <h1 className="ios-title-1 mt-1 mb-3" style={{ color: 'var(--label)' }}>{drill.title}</h1>

        <div className="rounded-[12px] p-4 mb-5" style={{ background: 'var(--tint-secondary)' }}>
          <div className="ios-caption-1 uppercase tracking-wide mb-1" style={{ color: 'var(--tint)' }}>Technique</div>
          <p className="ios-body" style={{ color: 'var(--label)' }}>{drill.technique}</p>
        </div>

        <div className="ios-footnote uppercase tracking-wide mb-2" style={{ color: 'var(--label-secondary)' }}>Drill</div>
        <p className="ios-body whitespace-pre-line mb-6" style={{ color: 'var(--label)', fontSize: 18, lineHeight: 1.55 }}>
          {drill.prompt}
        </p>

        <div className="ios-footnote uppercase tracking-wide mb-2" style={{ color: 'var(--label-secondary)' }}>How it went (optional)</div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Where did it break? What worked?"
          className="w-full bg-transparent outline-none resize-none ios-body p-3 rounded-[10px]"
          style={{
            color: 'var(--label)',
            minHeight: 80,
            background: 'var(--surface-elevated)',
            border: '0.5px solid var(--separator)',
          }}
        />

        {/* Chat with coach about this drill */}
        <div className="mt-5">
          <Link to="/chat/$persona" params={{ persona: 'speech-coach' }} search={{ name: undefined }}>
            <div className="rounded-[12px] p-3 flex items-center gap-3 active:opacity-80"
                 style={{ background: 'var(--bg-grouped-secondary)' }}>
              <div className="w-9 h-9 rounded-[9px] flex items-center justify-center"
                   style={{ background: 'var(--tint)', color: 'white' }}>
                <Icon name="brain" size={18} />
              </div>
              <div className="flex-1">
                <div className="ios-headline" style={{ color: 'var(--label)' }}>Stuck? Ask the coach</div>
                <div className="ios-footnote" style={{ color: 'var(--label-secondary)' }}>Targeted feedback on this drill</div>
              </div>
              <Icon name="chevron-right" size={16} />
            </div>
          </Link>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="nav-bar-blur safe-bottom px-4 py-3 sticky bottom-0 flex items-center gap-3 border-t"
           style={{ borderColor: 'var(--separator)' }}>
        <div className="flex-1" />
        {done ? (
          <div className="ios-headline" style={{ color: 'var(--green)' }}>+50 XP · Leader ✓</div>
        ) : (
          <Button variant="filled" onClick={complete}>Mark done · +50 XP</Button>
        )}
      </div>
    </div>
  );
}
