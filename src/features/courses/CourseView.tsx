import { Link } from '@tanstack/react-router';
import { LargeTitle, Card } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import type { Course } from '@/domain/courses';
import { useStore } from '@/domain/store';

/**
 * CourseView — renders one course as a college-style curriculum.
 *
 *   Hero: course name + byline + intro + progress bar
 *   For each module (set):
 *     Module header (M1 The Grabber)
 *     Numbered challenges (1.1, 1.2, 1.3…) with completion checkmark
 *     Tap any → /brain/challenge/$courseId/$challengeId
 */
export function CourseView({ course }: { course: Course }) {
  const challengeProgress = useStore(s => s.challengeProgress);

  const total = course.sets.reduce((s, set) => s + set.challenges.length, 0);
  const done = course.sets.reduce(
    (s, set) => s + set.challenges.filter(c => challengeProgress[c.id]).length,
    0,
  );
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="pb-12">
      <header className="safe-top px-4 pt-3 pb-2 flex items-center justify-between">
        <Link to="/brain" className="ios-body" style={{ color: 'var(--tint)' }}>
          <Icon name="chevron-left" size={16} /> Ascension
        </Link>
        <div className="ios-headline" style={{ color: 'var(--label)' }}>{course.emoji} Course</div>
        <div className="w-12" />
      </header>

      <LargeTitle
        title={course.name}
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>{course.byline}</span>}
      />

      {/* Progress + intro */}
      <section className="px-4 mb-6">
        <Card>
          <div className="ios-body mb-3" style={{ color: 'var(--label)' }}>{course.intro}</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--fill-tertiary)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--tint)' }} />
            </div>
            <div className="ios-headline font-mono" style={{ color: 'var(--label)' }}>{pct}%</div>
          </div>
          <div className="ios-footnote mt-1 text-right" style={{ color: 'var(--label-secondary)' }}>
            {done} / {total} challenges
          </div>
        </Card>
      </section>

      {/* Modules */}
      {course.sets.map(set => {
        const setDone = set.challenges.filter(c => challengeProgress[c.id]).length;
        return (
          <section key={set.id} className="px-4 mb-6">
            {/* Module header */}
            <div className="flex items-start gap-3 mb-3 px-1">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl"
                   style={{ background: 'var(--fill-tertiary)' }}>
                {set.emoji}
              </div>
              <div className="flex-1">
                <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--tint)' }}>
                  Module {set.number}
                </div>
                <div className="ios-title-3" style={{ color: 'var(--label)' }}>{set.title}</div>
                <div className="ios-footnote italic mt-0.5" style={{ color: 'var(--label-secondary)' }}>{set.hook}</div>
              </div>
              <div className="ios-caption-1 font-mono pt-1" style={{ color: 'var(--label-tertiary)' }}>
                {setDone}/{set.challenges.length}
              </div>
            </div>

            {/* Challenges */}
            <div className="ios-list">
              {set.challenges.map(ch => {
                const prog = challengeProgress[ch.id];
                const isDone = !!prog;
                return (
                  <Link
                    key={ch.id}
                    to="/brain/challenge/$courseId/$challengeId"
                    params={{ courseId: course.id, challengeId: ch.id }}
                  >
                    <div className="ios-row active:bg-[color:var(--fill-tertiary)] transition-colors">
                      {/* Number badge */}
                      <div
                        className="w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0"
                        style={{
                          background: isDone ? 'var(--green)' : 'var(--fill-tertiary)',
                          color: isDone ? 'white' : 'var(--label)',
                        }}
                      >
                        {isDone ? (
                          <Icon name="check" size={18} />
                        ) : (
                          <span className="ios-headline font-mono">{ch.number}</span>
                        )}
                      </div>
                      {/* Title + brief */}
                      <div className="flex-1 min-w-0">
                        <div className="ios-body flex items-center gap-1.5" style={{ color: 'var(--label)', opacity: isDone ? 0.65 : 1 }}>
                          <span className="truncate">{ch.title}</span>
                          <TypeBadge type={ch.type} />
                        </div>
                        <div className="ios-footnote mt-0.5 truncate" style={{ color: 'var(--label-secondary)' }}>
                          {ch.brief}
                        </div>
                      </div>
                      {/* XP + min */}
                      <div className="text-right shrink-0">
                        <div className="ios-footnote font-mono" style={{ color: 'var(--label-secondary)' }}>+{ch.xp}</div>
                        <div className="ios-caption-2" style={{ color: 'var(--label-tertiary)' }}>{ch.minutes} min</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function TypeBadge({ type }: { type: 'drill' | 'read' | 'chat' | 'monologue' }) {
  const meta = type === 'drill'    ? { label: 'Drill',    color: 'var(--tint)' }
             : type === 'read'     ? { label: 'Read',     color: 'var(--purple)' }
             : type === 'chat'     ? { label: 'Chat',     color: 'var(--green)' }
             :                       { label: 'Speak',    color: 'var(--orange)' };
  return (
    <span className="ios-caption-2 font-mono px-1.5 py-0.5 rounded shrink-0"
          style={{ background: 'color-mix(in srgb, ' + meta.color + ' 18%, transparent)', color: meta.color }}>
      {meta.label}
    </span>
  );
}
