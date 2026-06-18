import { useEffect, useRef, useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { LargeTitle, Card, Button, ListGroup, Row } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { generateMonologue, PRESET_CONTEXTS, VOICES, type MonologueResult } from '@/domain/monologue';
import { MissingKeyError } from '@/domain/llm';
import { useStore } from '@/domain/store';

export const Route = createFileRoute('/speech/monologue')({ component: Monologue });

/**
 * MONOLOGUES — "Who are we monologuing today?"
 *
 * Pick a context (preset or custom) + voice (your own or a character) + length
 * (60/120/180 sec). LLM generates a speakable monologue + delivery notes.
 * Enter practice mode: full-screen text + countdown timer + "Mark done" awards
 * Speech XP + opens chat with the character (if a voice was picked).
 */
function Monologue() {
  const navigate = useNavigate();
  const completeSpeechDrill = useStore(s => s.completeSpeechDrill);

  // setup state
  const [context, setContext] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [voice, setVoice] = useState<string>('self');
  const [durationSec, setDurationSec] = useState(60);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // result state
  const [result, setResult] = useState<MonologueResult | null>(null);

  // practice timer
  const [practicing, setPracticing] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!practicing) return;
    tickRef.current = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [practicing]);

  const finalContext = customContext.trim() || context;

  async function generate() {
    if (!finalContext) return;
    setBusy(true); setError(null);
    try {
      const r = await generateMonologue({ context: finalContext, voice, durationSec });
      setResult(r);
      setRemaining(r.durationSec);
    } catch (e: any) {
      if (e instanceof MissingKeyError) setError(`Set your ${e.provider} key in Profile → Settings.`);
      else setError(e?.message ?? 'Failed');
    } finally { setBusy(false); }
  }

  function markDone() {
    completeSpeechDrill('monologue-' + Date.now(), 75);
    setPracticing(false);
    setResult(null);
    setCustomContext('');
    setContext('');
    navigate({ to: '/speech' });
  }

  /* ── PRACTICE MODE — full screen text + timer + done ── */
  if (result && practicing) {
    const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
    const ss = String(remaining % 60).padStart(2, '0');
    return (
      <div className="flex flex-col" style={{ height: '100dvh', background: 'var(--bg)' }}>
        <header className="safe-top px-4 py-2 flex items-center justify-between border-b"
                style={{ borderColor: 'var(--separator)' }}>
          <button onClick={() => setPracticing(false)} className="ios-body" style={{ color: 'var(--tint)' }}>← Back</button>
          <div className="ios-headline font-mono tabular-nums" style={{ color: remaining < 10 ? 'var(--red)' : 'var(--label)' }}>{mm}:{ss}</div>
          <Button variant="filled" onClick={markDone}>Done</Button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="ios-footnote uppercase tracking-wide mb-2" style={{ color: 'var(--label-secondary)' }}>
            {result.title}
          </div>
          <p className="whitespace-pre-wrap" style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 22,
            lineHeight: 1.5,
            color: 'var(--label)',
          }}>{result.text}</p>
        </div>
      </div>
    );
  }

  /* ── RESULT VIEW (post-generation, pre-practice) ── */
  if (result) {
    return (
      <div className="pb-12">
        <header className="safe-top px-4 pt-3 pb-2 flex items-center justify-between">
          <button onClick={() => setResult(null)} className="ios-body" style={{ color: 'var(--tint)' }}>
            <Icon name="chevron-left" size={16} /> Setup
          </button>
          <div className="ios-headline" style={{ color: 'var(--label)' }}>Monologue</div>
          <Link to="/speech" className="ios-body" style={{ color: 'var(--tint)' }}>Done</Link>
        </header>

        <LargeTitle title={result.title} subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>{voiceLabel(voice)} · {Math.round(result.durationSec / 60)} min</span>} />

        <section className="px-4 mb-4">
          <Card>
            <p className="whitespace-pre-wrap" style={{
              fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.5, color: 'var(--label)',
            }}>{result.text}</p>
          </Card>
        </section>

        {result.notes.length > 0 && (
          <ListGroup header="Delivery notes">
            {result.notes.map((n, i) => (
              <Row key={i} title={n} />
            ))}
          </ListGroup>
        )}

        <section className="px-4 flex gap-2 mb-6">
          <Button variant="filled" fullWidth size="lg" onClick={() => { setRemaining(result.durationSec); setPracticing(true); }}>
            Practice now
          </Button>
          <Button variant="gray" size="lg" onClick={generate}>Re-roll</Button>
        </section>

        {voice !== 'self' && (
          <section className="px-4 mb-12">
            <Link to="/chat/$persona" params={{ persona: 'monologue-' + slug(voice) }} search={{ name: voice }}>
              <Card>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl"
                       style={{ background: 'var(--tint-secondary)' }}>🎭</div>
                  <div className="flex-1">
                    <div className="ios-headline" style={{ color: 'var(--label)' }}>Chat with {voice}</div>
                    <div className="ios-footnote" style={{ color: 'var(--label-secondary)' }}>
                      Ask for variations, feedback, alternate angles
                    </div>
                  </div>
                  <Icon name="chevron-right" size={16} />
                </div>
              </Card>
            </Link>
          </section>
        )}
      </div>
    );
  }

  /* ── SETUP VIEW — pick context, voice, length ── */
  return (
    <div className="pb-12">
      <header className="safe-top px-4 pt-3 pb-2 flex items-center justify-between">
        <Link to="/speech" className="ios-body" style={{ color: 'var(--tint)' }}>
          <Icon name="chevron-left" size={16} /> Speech
        </Link>
        <div className="ios-headline" style={{ color: 'var(--label)' }}>Monologue</div>
        <div className="w-12" />
      </header>

      <LargeTitle
        title="Who are we monologuing today?"
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>Pick a scenario · a voice · a length</span>}
      />

      {/* Custom context input */}
      <section className="px-4 mb-4">
        <div className="px-4 mb-1.5 ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>
          Your context
        </div>
        <Card>
          <input
            type="text"
            value={customContext}
            onChange={e => { setCustomContext(e.target.value); if (e.target.value) setContext(''); }}
            placeholder="Type your scenario, or pick a preset below"
            autoCorrect="off"
            autoCapitalize="sentences"
            className="w-full bg-transparent ios-body outline-none"
            style={{ color: 'var(--label)' }}
          />
        </Card>
      </section>

      {/* Preset contexts */}
      <ListGroup header="Or pick a preset">
        {PRESET_CONTEXTS.map(c => (
          <Row
            key={c}
            leading={
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                   style={{ borderColor: c === context && !customContext ? 'var(--tint)' : 'var(--label-quaternary)' }}>
                {c === context && !customContext && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--tint)' }} />}
              </div>
            }
            title={c}
            onClick={() => { setContext(c); setCustomContext(''); }}
          />
        ))}
      </ListGroup>

      {/* Voice picker */}
      <ListGroup header="In whose voice?" footer="'As X' will lock the LLM into that person's cadence + signature moves.">
        {VOICES.map(v => (
          <Row
            key={v.value}
            leading={
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                   style={{ borderColor: voice === v.value ? 'var(--tint)' : 'var(--label-quaternary)' }}>
                {voice === v.value && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--tint)' }} />}
              </div>
            }
            title={v.label}
            onClick={() => setVoice(v.value)}
          />
        ))}
      </ListGroup>

      {/* Duration picker */}
      <section className="px-4 mb-6">
        <div className="px-4 mb-1.5 ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>
          Length
        </div>
        <Card>
          <div className="grid grid-cols-3 gap-2">
            {[60, 120, 180].map(s => (
              <button
                key={s}
                onClick={() => setDurationSec(s)}
                className="h-[44px] rounded-[10px] ios-headline transition-colors"
                style={{
                  background: durationSec === s ? 'var(--tint)' : 'var(--fill-tertiary)',
                  color: durationSec === s ? 'white' : 'var(--label)',
                }}
              >
                {s / 60} min
              </button>
            ))}
          </div>
        </Card>
      </section>

      {error && (
        <div className="mx-4 mb-4 p-3 rounded-[10px] ios-callout"
             style={{ background: 'color-mix(in srgb, var(--red) 14%, transparent)', color: 'var(--red)' }}>
          {error}
          {error.includes('Settings') && (
            <Link to="/settings" className="ml-2 ios-headline" style={{ color: 'var(--tint)' }}>Open →</Link>
          )}
        </div>
      )}

      <section className="px-4">
        <Button variant="filled" size="lg" fullWidth onClick={generate}>
          {busy ? 'Writing your monologue…' : finalContext ? `Generate ${voice === 'self' ? '' : 'as ' + voice + ' '}(${durationSec}s)` : 'Pick or type a context'}
        </Button>
      </section>
    </div>
  );
}

function voiceLabel(v: string): string {
  const found = VOICES.find(x => x.value === v);
  return found?.label ?? v;
}
function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
