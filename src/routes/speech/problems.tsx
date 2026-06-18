import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, Card, Button } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';

export const Route = createFileRoute('/speech/problems')({ component: Problems });

const PROBLEMS = [
  {
    title: 'Addiction to dead phrases',
    body: 'Phrases used so recreationally they\'ve been stripped of all power. "Pursue that avenue", "Achilles heel", "secret sauce", "leverage", "synergy". They save you the mental work of finding precise words — but they deaden your sentences.',
    fix: 'Dead Phrase Audit: record 2 min of yourself speaking. Transcribe. Highlight every dead phrase. Rewrite eliminating every one.',
    drillRef: '/speech/drill/vocab-dead-phrase',
  },
  {
    title: 'Small surface lexicon',
    body: 'Surface lexicon: the 500–1,500 words you use without thinking. Deep lexicon: the 20,000–35,000 you recognize but never use. You know the words — you just haven\'t moved them into active rotation.',
    fix: '3×5 Daily Diet — 5 min reading above your level, 5 min poetry aloud, 5 min listen + visualize words.',
    drillRef: '/speech/drill/diet-3x5',
  },
  {
    title: 'Weak thought retention',
    body: 'If you can\'t hold a thought for more than 10 seconds, your speech follows every new wind and never climbs high. Articulate speakers grip a thought long enough to peel its layers.',
    fix: 'One Idea, 60 Seconds: pick ONE idea, speak about ONLY that for 60 seconds without changing topics.',
    drillRef: '/speech/drill/grip-60-second',
  },
];

function Problems() {
  return (
    <div className="pb-12">
      <header className="safe-top px-4 pt-3 pb-2 flex items-center justify-between">
        <Link to="/speech" className="ios-body" style={{ color: 'var(--tint)' }}>
          <Icon name="chevron-left" size={16} /> Speech
        </Link>
        <div className="ios-headline" style={{ color: 'var(--label)' }}>The 3 Problems</div>
        <div className="w-12" />
      </header>

      <LargeTitle
        title="3 Core Problems That Kill Articulation"
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>Diagnose first. Then drill the specific failure.</span>}
      />

      <div className="px-4 space-y-3">
        {PROBLEMS.map((p, i) => (
          <Card key={i}>
            <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--red)' }}>
              Problem {i + 1}
            </div>
            <div className="ios-title-3 mt-0.5" style={{ color: 'var(--label)' }}>{p.title}</div>
            <p className="ios-body mt-2" style={{ color: 'var(--label)' }}>{p.body}</p>
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--separator)' }}>
              <div className="ios-footnote uppercase tracking-wide mb-0.5" style={{ color: 'var(--green)' }}>The fix</div>
              <p className="ios-callout mb-3" style={{ color: 'var(--label)' }}>{p.fix}</p>
              <Link to={p.drillRef as any}>
                <Button variant="tinted">Run that drill →</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
