import { useEffect, useRef, useState } from 'react';
import { createFileRoute, useParams, useNavigate, Link } from '@tanstack/react-router';
import { Icon } from '@/ui/Icon';
import { Button } from '@/ui/primitives';
import { drillById } from '@/domain/drills';
import { gradePiece, saveGradedToVault, type GradeResult } from '@/domain/grading';
import { archetypeForDrill } from '@/domain/archetypes';
import { useStore } from '@/domain/store';
import { useQueryClient } from '@tanstack/react-query';

export const Route = createFileRoute('/brain/drill/$id')({ component: Drill });

function Drill() {
  const { id } = useParams({ from: '/brain/drill/$id' });
  const drill = drillById(id);
  const navigate = useNavigate();
  const awardDrillCompletion = useStore(s => s.awardDrillCompletion);
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [seconds, setSeconds] = useState((drill?.minutes ?? 10) * 60);
  const [running, setRunning] = useState(false);
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist draft to localStorage so accidental nav doesn't nuke work
  const draftKey = `sovereign.drill.draft.${id}`;
  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved) setText(saved);
  }, [draftKey]);
  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(draftKey, text), 400);
    return () => clearTimeout(t);
  }, [draftKey, text]);

  // Timer
  useEffect(() => {
    if (!running) return;
    const i = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(i);
  }, [running]);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }, [text]);

  if (!drill) {
    return (
      <div className="p-6">
        <div className="ios-body">Drill not found.</div>
        <div className="mt-3"><Link to="/brain" className="ios-headline" style={{ color: 'var(--tint)' }}>Back to Brain</Link></div>
      </div>
    );
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  async function onSubmit() {
    if (!drill) return;
    if (text.trim().length < 40) return alert('Write at least a few sentences before grading.');
    setGrading(true);
    setRunning(false);
    try {
      const r = await gradePiece(text, drill);
      setResult(r);
      if (!r.stub) {
        const p = await saveGradedToVault(text, drill, r);
        setSavedPath(p);
        localStorage.removeItem(draftKey);
        // Award XP to the right archetype + bump streak/aura via the persistent store.
        // Total score normalized to /100 for the XP grant.
        const max = r.signature ? 100 : 60;
        const xpAward = Math.round((r.total / max) * 100);
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        awardDrillCompletion({ archetype: archetypeForDrill(drill), xp: xpAward, words });
        // Invalidate the graded list so Brain + History pick up the new entry.
        queryClient.invalidateQueries({ queryKey: ['graded'] });
      }
    } finally {
      setGrading(false);
    }
  }

  if (result) return <Result drill={drill} piece={text} result={result} savedPath={savedPath} onRestart={() => { setResult(null); setSavedPath(null); }} onDone={() => navigate({ to: '/brain' })} />;

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <div
        className="nav-bar-blur safe-top px-4 py-2 flex items-center justify-between sticky top-0 z-10"
      >
        <Link to="/brain/studio/$lane" params={{ lane: drill.lane }} className="ios-body flex items-center gap-1"
              style={{ color: 'var(--tint)' }}>
          <Icon name="chevron-left" size={16} />Studio
        </Link>
        <div className="ios-headline font-mono tabular-nums" style={{ color: seconds < 60 ? 'var(--red)' : 'var(--label)' }}>
          {mm}:{ss}
        </div>
        <button onClick={() => setRunning(r => !r)} className="ios-body" style={{ color: 'var(--tint)' }}>
          {running ? 'Pause' : seconds === drill.minutes * 60 ? 'Start' : 'Resume'}
        </button>
      </div>

      {/* Prompt */}
      <div className="px-5 pt-4">
        <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>
          {drill.lane} · {drill.skill}{drill.author ? ` · ${drill.author}` : ''}
        </div>
        <h1 className="ios-title-1 mt-1" style={{ color: 'var(--label)' }}>{drill.title}</h1>
        <p className="ios-body mt-2" style={{ color: 'var(--label-secondary)' }}>{drill.prompt}</p>
      </div>

      {/* Editor */}
      <div className="flex-1 px-5 pt-4 pb-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => { setText(e.target.value); if (!running && seconds === drill.minutes * 60) setRunning(true); }}
          placeholder="Start writing…"
          className="w-full bg-transparent outline-none resize-none ios-body leading-[1.55]"
          style={{ color: 'var(--label)', minHeight: '40dvh', fontFamily: 'var(--font-serif)', fontSize: 18 }}
          autoFocus
        />
      </div>

      {/* Footer */}
      <div
        className="nav-bar-blur safe-bottom px-4 py-3 sticky bottom-0 flex items-center gap-3 border-t"
        style={{ borderColor: 'var(--separator)' }}
      >
        <div className="ios-footnote font-mono" style={{ color: 'var(--label-secondary)' }}>{wordCount} words</div>
        <div className="flex-1" />
        <Button variant="filled" onClick={onSubmit}>
          {grading ? 'Grading…' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}

function Result({ drill, piece, result, savedPath, onRestart, onDone }: {
  drill: { title: string; minutes: number };
  piece: string;
  result: GradeResult;
  savedPath: string | null;
  onRestart: () => void;
  onDone: () => void;
}) {
  const max = result.signature ? 100 : 60;
  return (
    <div className="p-5 pb-24">
      <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>Graded</div>
      <h1 className="ios-large-title" style={{ color: 'var(--label)' }}>{drill.title}</h1>

      {result.stub ? (
        <div className="mt-4 p-4 rounded-[12px] ios-callout"
             style={{ background: 'var(--fill-tertiary)', color: 'var(--label-secondary)' }}>
          {result.stub}
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-end gap-3">
            <div className="ios-large-title leading-none" style={{ color: 'var(--tint)', fontSize: 64 }}>{result.total}</div>
            <div className="ios-headline pb-2" style={{ color: 'var(--label-secondary)' }}>/ {max}</div>
          </div>

          <Section title="Universal Rubric (/60)">
            {result.universal.map(d => <DimRow key={d.name} d={d} />)}
          </Section>

          {result.signature && (
            <Section title={`Signature — ${result.signatureName} (/40)`}>
              {result.signature.map(d => <DimRow key={d.name} d={d} />)}
            </Section>
          )}

          <Section title="What's Working">
            {result.whatsWorking.map((q, i) => <li key={i} className="ios-callout my-1 ml-5 list-disc" style={{ color: 'var(--label)' }}>{q}</li>)}
          </Section>
          <Section title="What's Breaking">
            {result.whatsBreaking.map((q, i) => <li key={i} className="ios-callout my-1 ml-5 list-disc" style={{ color: 'var(--label)' }}>{q}</li>)}
          </Section>

          <Section title="Weakest dimension">
            <div className="ios-headline" style={{ color: 'var(--red)' }}>{result.weakestDimension}</div>
          </Section>
          <Section title="One revision instruction">
            <p className="ios-body" style={{ color: 'var(--label)' }}>{result.revisionInstruction}</p>
          </Section>

          {savedPath && (
            <div className="mt-6 p-3 rounded-[10px] ios-footnote font-mono"
                 style={{ background: 'var(--tint-secondary)', color: 'var(--tint)' }}>
              ✓ Saved to vault: <span className="break-all">{savedPath}</span>
            </div>
          )}
        </>
      )}

      <div className="mt-8 flex gap-3">
        <Button variant="gray" fullWidth onClick={onRestart}>Revise</Button>
        <Button variant="filled" fullWidth onClick={onDone}>Done</Button>
      </div>

      <details className="mt-6 ios-footnote" style={{ color: 'var(--label-secondary)' }}>
        <summary>View submitted piece</summary>
        <pre className="mt-3 whitespace-pre-wrap ios-callout" style={{ fontFamily: 'var(--font-serif)' }}>{piece}</pre>
      </details>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <div className="ios-footnote uppercase tracking-wide mb-2" style={{ color: 'var(--label-secondary)' }}>{title}</div>
      <div>{children}</div>
    </section>
  );
}
function DimRow({ d }: { d: { name: string; score: number; evidence: string; reason: string } }) {
  return (
    <div className="py-2 border-b last:border-b-0" style={{ borderColor: 'var(--separator)' }}>
      <div className="flex items-baseline justify-between gap-3">
        <div className="ios-headline" style={{ color: 'var(--label)' }}>{d.name}</div>
        <div className="ios-headline font-mono tabular-nums" style={{ color: scoreColor(d.score) }}>{d.score}/10</div>
      </div>
      {d.evidence && <div className="ios-footnote mt-0.5 italic" style={{ color: 'var(--label-secondary)' }}>"{d.evidence}"</div>}
      {d.reason && <div className="ios-footnote mt-1" style={{ color: 'var(--label-tertiary)' }}>{d.reason}</div>}
    </div>
  );
}
function scoreColor(s: number) {
  if (s >= 9) return 'var(--green)';
  if (s >= 7) return 'var(--tint)';
  if (s >= 5) return 'var(--orange)';
  return 'var(--red)';
}
