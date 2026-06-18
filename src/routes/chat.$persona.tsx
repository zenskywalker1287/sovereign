import { useEffect, useRef, useState } from 'react';
import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { Icon } from '@/ui/Icon';
import {
  PERSONAS, characterPersona, loadHistory, saveHistory, clearHistory,
  sendChatMessage, type ChatMessage,
} from '@/domain/coach';
import { MissingKeyError } from '@/domain/llm';

export const Route = createFileRoute('/chat/$persona')({
  component: ChatScreen,
  validateSearch: (s: Record<string, unknown>) => ({
    name: typeof s.name === 'string' ? s.name : undefined,
  }),
});

function ChatScreen() {
  const { persona: personaKey } = useParams({ from: '/chat/$persona' });
  // For monologue-* keys we accept a ?name= search param so we know which character.
  const search = Route.useSearch();
  const persona = personaKey.startsWith('monologue-') && search.name
    ? characterPersona(search.name)
    : PERSONAS[personaKey];

  const [history, setHistory] = useState<ChatMessage[]>(() => persona ? loadHistory(persona.key) : []);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, busy]);

  // Auto-grow input
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [input]);

  if (!persona) {
    return (
      <div className="p-6">
        <div className="ios-body">Persona not found.</div>
        <div className="mt-3"><Link to="/" className="ios-headline" style={{ color: 'var(--tint)' }}>Back</Link></div>
      </div>
    );
  }

  async function send(content?: string) {
    const txt = (content ?? input).trim();
    if (!txt || busy) return;
    setError(null);
    const userMsg: ChatMessage = { role: 'user', content: txt, ts: Date.now() };
    const next = [...history, userMsg];
    setHistory(next);
    setInput('');
    setBusy(true);
    try {
      const reply = await sendChatMessage(persona!, next, txt);
      const after = [...next, reply];
      setHistory(after);
      saveHistory(persona!.key, after);
    } catch (e: any) {
      if (e instanceof MissingKeyError) {
        setError(`Set your ${e.provider} key in Profile → Settings.`);
      } else {
        setError(e?.message ?? 'Failed');
      }
    } finally {
      setBusy(false);
    }
  }

  function onClear() {
    if (!confirm(`Clear chat with ${persona!.name}?`)) return;
    clearHistory(persona!.key);
    setHistory([]);
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh', background: 'var(--bg)' }}>
      {/* Top bar */}
      <header className="nav-bar-blur safe-top px-4 py-2 flex items-center justify-between border-b"
              style={{ borderColor: 'var(--separator)' }}>
        <Link to="/" className="ios-body" style={{ color: 'var(--tint)' }}>
          <Icon name="chevron-left" size={16} /> Done
        </Link>
        <div className="text-center">
          <div className="ios-headline" style={{ color: 'var(--label)' }}>
            {persona.emoji} {persona.name}
          </div>
        </div>
        <button onClick={onClear} className="ios-body" style={{ color: 'var(--tint)' }}>Clear</button>
      </header>

      {/* Messages */}
      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-4">
        {history.length === 0 ? (
          <EmptyState persona={persona} onPick={send} />
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((m, i) => (
              <Bubble key={i} msg={m} />
            ))}
            {busy && (
              <div className="flex gap-1 px-4 py-3 rounded-[18px] self-start max-w-[80%]"
                   style={{ background: 'var(--surface)' }}>
                <Dot delay="0ms" /><Dot delay="120ms" /><Dot delay="240ms" />
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-2 p-3 rounded-[10px] ios-footnote"
             style={{ background: 'color-mix(in srgb, var(--red) 14%, transparent)', color: 'var(--red)' }}>
          {error}
          {error.includes('Settings') && (
            <Link to="/settings" className="ml-2 ios-headline" style={{ color: 'var(--tint)' }}>Open →</Link>
          )}
        </div>
      )}

      {/* Composer */}
      <div className="nav-bar-blur safe-bottom px-3 py-2 border-t flex items-end gap-2"
           style={{ borderColor: 'var(--separator)' }}>
        <textarea
          ref={taRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && !e.metaKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder={busy ? '…' : `Message ${persona.name}`}
          className="flex-1 resize-none ios-body outline-none px-3 py-2 rounded-[18px]"
          style={{
            background: 'var(--surface)',
            color: 'var(--label)',
            maxHeight: 160,
          }}
        />
        <button
          onClick={() => send()}
          disabled={busy || !input.trim()}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity"
          style={{
            background: busy || !input.trim() ? 'var(--fill)' : 'var(--tint)',
            opacity: busy || !input.trim() ? 0.5 : 1,
          }}
          aria-label="Send"
        >
          <Icon name="arrow-up" size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div
      className="max-w-[82%] px-4 py-2.5 rounded-[18px] whitespace-pre-wrap"
      style={{
        background: isUser ? 'var(--tint)' : 'var(--surface)',
        color: isUser ? 'white' : 'var(--label)',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        borderBottomRightRadius: isUser ? 4 : 18,
        borderBottomLeftRadius: isUser ? 18 : 4,
      }}
    >
      <div className="ios-body" style={{ lineHeight: 1.4 }}>{msg.content}</div>
    </div>
  );
}

function EmptyState({ persona, onPick }: { persona: { emoji: string; name: string; hint: string; starters: string[] }; onPick: (s: string) => void }) {
  return (
    <div className="py-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{persona.emoji}</div>
        <div className="ios-title-2 mb-1" style={{ color: 'var(--label)' }}>{persona.name}</div>
        <div className="ios-footnote px-6" style={{ color: 'var(--label-secondary)' }}>{persona.hint}</div>
      </div>
      <div className="flex flex-col gap-2">
        {persona.starters.map((s, i) => (
          <button
            key={i}
            onClick={() => onPick(s)}
            className="text-left rounded-[12px] px-4 py-3 active:opacity-80 transition-opacity"
            style={{ background: 'var(--surface)', color: 'var(--label)' }}
          >
            <span className="ios-body">{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full"
      style={{
        background: 'var(--label-secondary)',
        animation: 'sov-typing 1.2s infinite',
        animationDelay: delay,
      }}
    />
  );
}
