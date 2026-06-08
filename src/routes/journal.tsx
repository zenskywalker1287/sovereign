import { useEffect, useRef, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, Button, Card } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { getVault } from '@/vault/adapter';
import { useStore } from '@/domain/store';

export const Route = createFileRoute('/journal')({ component: Journal });

const today = () => new Date().toISOString().slice(0, 10);
const PATH = (d: string) => `00-INBOX/journal/${d}.md`;

function Journal() {
  const date = today();
  const [text, setText] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tickActivity = useStore(s => s.tickActivity);

  // Load existing entry if any
  useEffect(() => {
    (async () => {
      const vault = await getVault();
      if (await vault.exists(PATH(date))) {
        const raw = await vault.read(PATH(date));
        // Strip frontmatter if present
        const body = raw.replace(/^---[\s\S]*?---\n*/, '');
        setText(body);
      }
      setLoaded(true);
    })();
  }, [date]);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.max(ta.scrollHeight, 240) + 'px';
  }, [text]);

  // Debounced auto-save (every 1.2 sec of typing pause)
  useEffect(() => {
    if (!loaded || !text.trim()) return;
    const t = setTimeout(() => save(), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [text, loaded]);

  async function save() {
    setSaving(true);
    try {
      const vault = await getVault();
      const md = `---
title: Journal — ${date}
date: ${date}
tags: [journal, daily]
---

${text}`;
      await vault.write(PATH(date), md);
      setSavedAt(Date.now());
      tickActivity();
    } finally { setSaving(false); }
  }

  return (
    <div>
      <LargeTitle
        title="Journal"
        trailing={
          <Link to="/profile" className="ios-headline" style={{ color: 'var(--tint)' }}>Done</Link>
        }
        subtitle={
          <span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>
            {date} · {saving ? 'Saving…' : savedAt ? 'Saved' : 'Auto-saves as you type'}
          </span>
        }
      />

      <section className="px-4 mb-3">
        <Card>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What moved? What's blocked? The one thing for tomorrow…"
            className="w-full bg-transparent outline-none resize-none ios-body leading-[1.55]"
            style={{ color: 'var(--label)', minHeight: 240, fontFamily: 'var(--font-serif)', fontSize: 18 }}
            autoFocus
          />
        </Card>
        <div className="px-4 mt-1.5 ios-footnote font-mono" style={{ color: 'var(--label-secondary)' }}>
          {PATH(date)}
        </div>
      </section>

      <div className="px-4 pb-12 flex gap-3">
        <Button variant="gray" fullWidth onClick={() => setText('')}>Clear</Button>
        <Button variant="filled" fullWidth onClick={save}>{saving ? 'Saving…' : 'Save now'}</Button>
      </div>
    </div>
  );
}
