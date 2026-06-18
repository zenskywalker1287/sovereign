import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, Card } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';

export const Route = createFileRoute('/speech/rules')({ component: Rules });

const RULES = [
  {
    n: 1,
    title: 'Practice conscious selection',
    body: 'Articulacy increases when you stop reaching for the pre-made phrase and engineer a fresh sentence instead.',
    drill: 'Before speaking, force a 2-second pause. Choose the precise word over the default one.',
  },
  {
    n: 2,
    title: 'Grow your surface lexicon',
    body: 'Effortless articulacy is limited to the size of the 500–1,500 words you reach for automatically. Expand it deliberately.',
    drill: 'Read 5 min above your current input every day. Notice 3 fresh words and use one tomorrow.',
  },
  {
    n: 3,
    title: 'Grip your thoughts longer',
    body: 'The longer you engage a single thought, the deeper you can go with words. Most speech is shallow because attention is.',
    drill: 'Pick one idea. Speak about ONLY it for 60 seconds without changing topics.',
  },
  {
    n: 4,
    title: 'Your inputs become your output',
    body: 'The quality of your speech is downstream of the quality of your language environments. Rate every input 1–10 on articulacy.',
    drill: 'Audit your last 7 days of inputs (podcasts, books, conversations). Replace the bottom 2.',
  },
  {
    n: 5,
    title: 'Rhythm matters as much as vocabulary',
    body: 'Articulate-sounding sentences flow because the words fit eloquent shapes. Read poetry aloud to train your mouth to feel them.',
    drill: '5 min poetry reading. Focus on cadence and breath, not meaning.',
  },
  {
    n: 6,
    title: 'Admit limits — it sounds confident',
    body: 'An honest "I\'d have to sit with that" is more articulate than a fluent vague answer. Intellectual humility ≠ weakness.',
    drill: 'Rehearse 5 honest-limit phrasings. Use one this week instead of a hedge.',
  },
  {
    n: 7,
    title: 'Stack it: selection · inputs · grip · rhythm · humility',
    body: 'The full game. Articulate people layer all 6 — they\'re downstream of habit, not talent.',
    drill: 'Each day, intentionally practice ONE rule. Rotate. 7 days = full sweep.',
  },
];

function Rules() {
  return (
    <div className="pb-12">
      <header className="safe-top px-4 pt-3 pb-2 flex items-center justify-between">
        <Link to="/speech" className="ios-body" style={{ color: 'var(--tint)' }}>
          <Icon name="chevron-left" size={16} /> Speech
        </Link>
        <div className="ios-headline" style={{ color: 'var(--label)' }}>The 7 Rules</div>
        <div className="w-12" />
      </header>

      <LargeTitle
        title="7 Rules of Articulacy"
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>Source: speech-training.md</span>}
      />

      <div className="px-4 space-y-3">
        {RULES.map(r => (
          <Card key={r.n}>
            <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--tint)' }}>
              Rule {r.n}
            </div>
            <div className="ios-title-3 mt-0.5" style={{ color: 'var(--label)' }}>{r.title}</div>
            <p className="ios-body mt-2" style={{ color: 'var(--label)' }}>{r.body}</p>
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--separator)' }}>
              <div className="ios-footnote uppercase tracking-wide mb-0.5" style={{ color: 'var(--label-secondary)' }}>Drill</div>
              <p className="ios-callout" style={{ color: 'var(--label)' }}>{r.drill}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
