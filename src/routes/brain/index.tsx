import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, Card } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { COURSES, DOMAIN_LABELS } from '@/domain/courses';
import { useStore } from '@/domain/store';

export const Route = createFileRoute('/brain/')({ component: Ascension });

/**
 * ASCENSION — the training tab.
 *
 * 3 big domain cards: COPY · FICTION · SPEECH.
 * Each opens its course page (a college-style curriculum with numbered
 * modules and challenges).
 *
 * No more drill bank thrown at the user. Pick a domain → pick a module →
 * run the next challenge in order.
 */
function Ascension() {
  const stats = useStore(s => s.stats);
  const challengeProgress = useStore(s => s.challengeProgress);

  return (
    <div className="pb-12">
      <LargeTitle
        title="Ascension"
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>3 domains · 9 modules · structured progression</span>}
      />

      {/* Stats strip — total challenges done */}
      <section className="px-4 mb-6">
        <Card>
          <div className="grid grid-cols-3">
            <Stat label="Challenges" value={Object.keys(challengeProgress).length.toString()} />
            <Stat label="Total XP"   value={fmtNum(stats.lifetimeXp)} />
            <Stat label="Streak"     value={`${stats.currentStreak}d`} />
          </div>
        </Card>
      </section>

      {/* Domain cards */}
      <section className="px-4 mb-6 space-y-3">
        {COURSES.map(course => {
          const totalChallenges = course.sets.reduce((s, set) => s + set.challenges.length, 0);
          const doneChallenges = course.sets.reduce(
            (s, set) => s + set.challenges.filter(c => challengeProgress[c.id]).length,
            0,
          );
          const pct = totalChallenges > 0 ? Math.round((doneChallenges / totalChallenges) * 100) : 0;
          const meta = DOMAIN_LABELS[course.domain];

          return (
            <Link key={course.id} to={course.domain === 'speech' ? '/brain/speech-course' : course.domain === 'copy' ? '/brain/copy' : '/brain/fiction'}>
              <Card>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-[12px] flex items-center justify-center text-2xl"
                       style={{ background: 'var(--fill-tertiary)' }}>
                    {meta.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>{meta.name}</div>
                    <div className="ios-title-3" style={{ color: 'var(--label)' }}>{course.name}</div>
                    <div className="ios-footnote mt-0.5" style={{ color: 'var(--label-secondary)' }}>{course.byline}</div>
                  </div>
                  <Icon name="chevron-right" size={16} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--fill-tertiary)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--tint)' }} />
                  </div>
                  <div className="ios-caption-1 font-mono" style={{ color: 'var(--label-secondary)' }}>
                    {doneChallenges} / {totalChallenges}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </section>

      <div className="px-4 ios-footnote" style={{ color: 'var(--label-secondary)' }}>
        Each domain is a course. Each course has modules. Each module has numbered challenges. Complete in order or jump around — XP flows either way.
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="ios-title-3" style={{ color: 'var(--label)' }}>{value}</div>
      <div className="ios-caption-2 mt-0.5" style={{ color: 'var(--label-secondary)' }}>{label}</div>
    </div>
  );
}
function fmtNum(n: number) {
  if (n >= 10_000) return Math.floor(n / 1000) + 'k';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}
