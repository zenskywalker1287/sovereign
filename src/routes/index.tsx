import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, Card, ListGroup, Row, Button } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { useStore, selectAuraPct, selectAuraLabel } from '@/domain/store';
import { getCachedDiet } from '@/domain/mental-diet';
import { DEFAULT_DAILY_MISSIONS } from '@/domain/missions';

export const Route = createFileRoute('/')({ component: Today });

/**
 * TODAY — the one-screen command center.
 *
 *   Greeting + Aura          (what state are you in)
 *   "Right now" hero         (the one thing the app wants you to do)
 *   Today's missions inline  (5 checkboxes, immediate XP feedback)
 *   Mental Diet preview      (the through-line if generated today)
 *   Quick capture row        (Watch · Journal · Surprise Me)
 *
 * No third-level navigation here. The whole screen reads like a daily ritual.
 */
function Today() {
  const profile = useStore(s => s.profile);
  const stats = useStore(s => s.stats);
  const auraPct = useStore(selectAuraPct);
  const auraLabel = selectAuraLabel(auraPct);
  const checks = useStore(s => s.todayChecks());
  const toggleMission = useStore(s => s.toggleMission);
  const missions = DEFAULT_DAILY_MISSIONS;
  const doneMissions = missions.filter(m => checks[m.id]);
  const undoneMissions = missions.filter(m => !checks[m.id]);
  const allDone = undoneMissions.length === 0;

  const diet = getCachedDiet();
  const greeting = greetingFor(new Date().getHours());

  // "Right now" — pick the single thing the user should do next.
  const rightNow = pickRightNow(undoneMissions, stats.drillsCompleted);

  return (
    <div>
      <LargeTitle
        title={greeting}
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>{profile.name}</span>}
        trailing={
          <Link to="/me" aria-label="Profile" className="active:opacity-60">
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
                 style={{ background: 'var(--fill-tertiary)' }}>
              <Icon name="circle-person" size={22} />
            </div>
          </Link>
        }
      />

      {/* Aura — quick mood read */}
      <section className="px-4 mb-4">
        <Card>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>
                Aura
              </div>
              <div className="ios-title-1" style={{ color: 'var(--label)' }}>{auraLabel}</div>
              <div className="ios-footnote mt-0.5" style={{ color: 'var(--label-secondary)' }}>
                {stats.currentStreak === 0 ? 'Start your streak today' : `${stats.currentStreak}-day streak`}
              </div>
            </div>
            <div className="text-right">
              <div className="ios-large-title leading-none" style={{ color: 'var(--tint)', fontSize: 56 }}>{auraPct}</div>
              <div className="ios-caption-2" style={{ color: 'var(--label-secondary)' }}>discipline</div>
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--fill-tertiary)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${auraPct}%`, background: 'var(--tint)' }} />
          </div>
        </Card>
      </section>

      {/* RIGHT NOW — the one thing the app wants you to do */}
      <section className="px-4 mb-6">
        <div className="ios-footnote uppercase tracking-wide mb-2 px-1" style={{ color: 'var(--label-secondary)' }}>
          Right now
        </div>
        <Link to={rightNow.to} params={rightNow.params as any}>
          <div className="rounded-[16px] p-5 active:opacity-90 transition-opacity"
               style={{ background: 'var(--tint)', color: 'white' }}>
            <div className="ios-caption-1 uppercase tracking-wide opacity-80">{rightNow.kicker}</div>
            <div className="ios-title-1 mt-1" style={{ color: 'white' }}>{rightNow.title}</div>
            <div className="ios-body mt-1 opacity-90">{rightNow.subtitle}</div>
            <div className="mt-4 inline-flex items-center gap-1 ios-headline">
              {rightNow.cta} <Icon name="arrow-right" size={16} />
            </div>
          </div>
        </Link>
      </section>

      {/* Daily missions inline */}
      <section className="px-4 mb-4">
        <div className="px-1 mb-2 flex justify-between items-baseline">
          <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>
            Today's Missions
          </div>
          <div className="ios-caption-1 font-mono" style={{ color: 'var(--label-tertiary)' }}>
            {doneMissions.length} / {missions.length}
          </div>
        </div>
        <div className="ios-list">
          {missions.map(m => {
            const done = !!checks[m.id];
            return (
              <button
                key={m.id}
                onClick={() => toggleMission(m.id)}
                className="ios-row w-full active:bg-[color:var(--fill-tertiary)] transition-colors text-left"
              >
                <Checkbox checked={done} />
                <div className="flex-1 min-w-0">
                  <div className="ios-body" style={{ color: 'var(--label)', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.55 : 1 }}>
                    {m.title}
                  </div>
                  <div className="ios-footnote mt-0.5" style={{ color: 'var(--label-secondary)' }}>{m.subtitle}</div>
                </div>
                <div className="ios-footnote font-mono" style={{ color: 'var(--label-secondary)' }}>+{m.xp}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Mental Diet preview */}
      <section className="px-4 mb-4">
        <Link to="/diet" className="block">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[9px] flex items-center justify-center"
                   style={{ background: 'var(--pink)', color: 'white' }}>
                <Icon name="sparkles" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>
                  Mental Diet
                </div>
                <div className="ios-body" style={{ color: 'var(--label)' }}>
                  {diet ? diet.throughLine : 'Generate today\'s feed'}
                </div>
              </div>
              <Icon name="chevron-right" size={14} />
            </div>
          </Card>
        </Link>
      </section>

      {/* Quick capture row */}
      <section className="px-4 pb-2">
        <div className="grid grid-cols-3 gap-2">
          <QuickTile to="/journal" color="var(--orange)" icon="pencil"   label="Journal" />
          <QuickTile to="/watch"   color="var(--teal)"   icon="sparkles" label="Watch" />
          <QuickTile to="/surprise" color="var(--purple)" icon="brain"   label="Surprise" />
        </div>
      </section>

      {allDone && (
        <section className="px-4 pt-4 pb-2 text-center">
          <div className="ios-headline" style={{ color: 'var(--green)' }}>✓ All missions complete</div>
          <div className="ios-footnote mt-0.5" style={{ color: 'var(--label-secondary)' }}>Locked in. See you tomorrow.</div>
        </section>
      )}
    </div>
  );
}

function QuickTile({ to, color, icon, label }: { to: any; color: string; icon: any; label: string }) {
  return (
    <Link to={to}>
      <div className="rounded-[12px] py-3 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform"
           style={{ background: 'var(--bg-grouped-secondary)' }}>
        <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ background: color, color: 'white' }}>
          <Icon name={icon} size={18} />
        </div>
        <div className="ios-caption-1 font-semibold" style={{ color: 'var(--label)' }}>{label}</div>
      </div>
    </Link>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div
      className="w-[24px] h-[24px] rounded-full flex items-center justify-center transition-all shrink-0"
      style={{
        background: checked ? 'var(--green)' : 'transparent',
        border: checked ? 'none' : '1.5px solid var(--label-quaternary)',
      }}
    >
      {checked && <Icon name="check" size={15} className="text-white" />}
    </div>
  );
}

interface RightNow { kicker: string; title: string; subtitle: string; cta: string; to: any; params?: any }
function pickRightNow(undoneMissions: typeof DEFAULT_DAILY_MISSIONS, drillsCompleted: number): RightNow {
  // Priority 1 — if you haven't done a writing drill today, that's the highest-leverage 15 min
  // (heuristic: if total drills < 1 per day on average since you joined, recommend one)
  if (drillsCompleted < 3) {
    return {
      kicker: 'Writing studio',
      title: 'Run a 10-min drill',
      subtitle: 'Halbert · Meyer · or freeform. Get graded.',
      cta: 'Start',
      to: '/brain',
    };
  }
  // Priority 2 — highest-XP unchecked mission
  if (undoneMissions.length > 0) {
    const next = [...undoneMissions].sort((a, b) => b.xp - a.xp)[0];
    return {
      kicker: 'Mission',
      title: next.title,
      subtitle: `${next.subtitle} · +${next.xp} XP`,
      cta: 'Do it',
      to: '/',  // already here, the checkbox is inline
    };
  }
  // Priority 3 — all missions done; recommend Mental Diet think prompt
  return {
    kicker: 'You\'re ahead',
    title: 'Think about today',
    subtitle: 'Generate your mental diet · synthesize.',
    cta: 'Open',
    to: '/diet',
  };
}

function greetingFor(h: number) {
  if (h < 5)  return 'Late Night';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return 'Tonight';
}
