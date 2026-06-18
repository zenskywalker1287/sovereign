import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, Card, ListGroup, Row, Button } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { useStore, selectAuraPct, selectAuraLabel } from '@/domain/store';
import { getCachedDiet } from '@/domain/mental-diet';
import { DEFAULT_DAILY_MISSIONS } from '@/domain/missions';
import { SCOPE_LABEL, type TaskScope, type CustomTask } from '@/domain/tasks';

export const Route = createFileRoute('/')({ component: Today });

/**
 * TODAY — one-screen command center.
 *
 *   Greeting + Aura
 *   "Right now" hero
 *   Today's Missions inline (5 defaults + any daily custom tasks + tap to toggle, "+" to add)
 *   This week (if any weekly custom tasks)
 *   This month (if any monthly custom tasks)
 *   Mental Diet preview
 *   Quick capture tiles
 */
function Today() {
  const profile = useStore(s => s.profile);
  const stats = useStore(s => s.stats);
  const auraPct = useStore(selectAuraPct);
  const auraLabel = selectAuraLabel(auraPct);
  const checks = useStore(s => s.todayChecks());
  const toggleMission = useStore(s => s.toggleMission);
  const customTasks = useStore(s => s.customTasks);
  const customTaskChecks = useStore(s => s.customTaskChecks);
  const toggleCustomTask = useStore(s => s.toggleCustomTask);

  const dailyCustom = customTasks.filter(t => t.scope === 'daily');
  const weeklyCustom = customTasks.filter(t => t.scope === 'weekly');
  const monthlyCustom = customTasks.filter(t => t.scope === 'monthly');

  const defaults = DEFAULT_DAILY_MISSIONS;
  const doneDefaults = defaults.filter(m => checks[m.id]);
  const undoneDefaults = defaults.filter(m => !checks[m.id]);
  const totalToday = defaults.length + dailyCustom.length;
  const doneToday = doneDefaults.length + dailyCustom.filter(t => isDoneNow(t, customTaskChecks)).length;
  const allDone = totalToday > 0 && doneToday === totalToday;

  const diet = getCachedDiet();
  const greeting = greetingFor(new Date().getHours());
  const rightNow = pickRightNow(undoneDefaults, stats.drillsCompleted);

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

      {/* Aura */}
      <section className="px-4 mb-4">
        <Card>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>Aura</div>
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

      {/* RIGHT NOW */}
      <section className="px-4 mb-6">
        <div className="ios-footnote uppercase tracking-wide mb-2 px-1" style={{ color: 'var(--label-secondary)' }}>Right now</div>
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

      {/* TODAY's missions: defaults + daily custom + "+" to add */}
      <section className="px-4 mb-4">
        <div className="px-1 mb-2 flex justify-between items-center">
          <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>
            Today's Missions
          </div>
          <div className="flex items-center gap-3">
            <span className="ios-caption-1 font-mono" style={{ color: 'var(--label-tertiary)' }}>{doneToday} / {totalToday}</span>
            <Link to="/tasks/new" search={{ scope: 'daily' as TaskScope }} className="active:opacity-60" aria-label="Add daily task">
              <div className="w-6 h-6 rounded-full flex items-center justify-center"
                   style={{ background: 'var(--fill-tertiary)' }}>
                <Icon name="plus" size={14} />
              </div>
            </Link>
          </div>
        </div>
        <div className="ios-list">
          {defaults.map(m => (
            <MissionRow
              key={m.id}
              title={m.title}
              subtitle={m.subtitle}
              xp={m.xp}
              done={!!checks[m.id]}
              onToggle={() => toggleMission(m.id)}
            />
          ))}
          {dailyCustom.map(t => (
            <MissionRow
              key={t.id}
              title={t.title}
              subtitle={t.subtitle ?? 'Custom task'}
              xp={t.xp}
              done={isDoneNow(t, customTaskChecks)}
              onToggle={() => toggleCustomTask(t.id)}
              custom
            />
          ))}
        </div>
      </section>

      {/* WEEKLY */}
      <TaskScopeSection
        scope="weekly"
        tasks={weeklyCustom}
        customTaskChecks={customTaskChecks}
        toggle={toggleCustomTask}
      />

      {/* MONTHLY */}
      <TaskScopeSection
        scope="monthly"
        tasks={monthlyCustom}
        customTaskChecks={customTaskChecks}
        toggle={toggleCustomTask}
      />

      {/* Manage tasks link (if any exist) */}
      {customTasks.length > 0 && (
        <section className="px-4 mb-2">
          <Link to="/tasks">
            <div className="ios-footnote text-center py-2" style={{ color: 'var(--tint)' }}>
              Manage your tasks →
            </div>
          </Link>
        </section>
      )}

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
                <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>Mental Diet</div>
                <div className="ios-body" style={{ color: 'var(--label)' }}>
                  {diet ? diet.throughLine : 'Generate today\'s feed'}
                </div>
              </div>
              <Icon name="chevron-right" size={14} />
            </div>
          </Card>
        </Link>
      </section>

      {/* Quick capture */}
      <section className="px-4 pb-2">
        <div className="grid grid-cols-3 gap-2">
          <QuickTile to="/journal"  color="var(--orange)" icon="pencil"   label="Journal" />
          <QuickTile to="/watch"    color="var(--teal)"   icon="sparkles" label="Watch" />
          <QuickTile to="/surprise" color="var(--purple)" icon="brain"    label="Surprise" />
        </div>
      </section>

      {allDone && (
        <section className="px-4 pt-4 pb-2 text-center">
          <div className="ios-headline" style={{ color: 'var(--green)' }}>✓ All today's tasks complete</div>
          <div className="ios-footnote mt-0.5" style={{ color: 'var(--label-secondary)' }}>Locked in. See you tomorrow.</div>
        </section>
      )}
    </div>
  );
}

function TaskScopeSection({ scope, tasks, customTaskChecks, toggle }: {
  scope: TaskScope;
  tasks: CustomTask[];
  customTaskChecks: { [k: string]: { [id: string]: boolean } };
  toggle: (id: string) => void;
}) {
  const doneCount = tasks.filter(t => isDoneNow(t, customTaskChecks)).length;
  return (
    <section className="px-4 mb-4">
      <div className="px-1 mb-2 flex justify-between items-center">
        <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>
          {SCOPE_LABEL[scope]}
        </div>
        <div className="flex items-center gap-3">
          {tasks.length > 0 && (
            <span className="ios-caption-1 font-mono" style={{ color: 'var(--label-tertiary)' }}>{doneCount} / {tasks.length}</span>
          )}
          <Link to="/tasks/new" search={{ scope }} className="active:opacity-60" aria-label={`Add ${scope} task`}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
                 style={{ background: 'var(--fill-tertiary)' }}>
              <Icon name="plus" size={14} />
            </div>
          </Link>
        </div>
      </div>
      {tasks.length === 0 ? (
        <Link to="/tasks/new" search={{ scope }}>
          <Card>
            <div className="ios-body" style={{ color: 'var(--label-secondary)' }}>
              No {scope === 'weekly' ? 'weekly' : 'monthly'} task yet · tap + to add
            </div>
          </Card>
        </Link>
      ) : (
        <div className="ios-list">
          {tasks.map(t => (
            <MissionRow
              key={t.id}
              title={t.title}
              subtitle={t.subtitle ?? `${scope === 'weekly' ? 'Weekly' : 'Monthly'} task`}
              xp={t.xp}
              done={isDoneNow(t, customTaskChecks)}
              onToggle={() => toggle(t.id)}
              custom
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MissionRow({ title, subtitle, xp, done, onToggle, custom }: {
  title: string; subtitle: string; xp: number; done: boolean; onToggle: () => void; custom?: boolean;
}) {
  return (
    <button onClick={onToggle} className="ios-row w-full active:bg-[color:var(--fill-tertiary)] transition-colors text-left">
      <Checkbox checked={done} />
      <div className="flex-1 min-w-0">
        <div className="ios-body flex items-center gap-1.5"
             style={{ color: 'var(--label)', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.55 : 1 }}>
          <span>{title}</span>
          {custom && <span className="ios-caption-2 font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--tint-secondary)', color: 'var(--tint)' }}>custom</span>}
        </div>
        <div className="ios-footnote mt-0.5" style={{ color: 'var(--label-secondary)' }}>{subtitle}</div>
      </div>
      <div className="ios-footnote font-mono" style={{ color: 'var(--label-secondary)' }}>+{xp}</div>
    </button>
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
  if (drillsCompleted < 3) {
    return {
      kicker: 'Writing studio',
      title: 'Run a 10-min drill',
      subtitle: 'Halbert · Meyer · or freeform. Get graded.',
      cta: 'Start',
      to: '/brain',
    };
  }
  if (undoneMissions.length > 0) {
    const next = [...undoneMissions].sort((a, b) => b.xp - a.xp)[0];
    return {
      kicker: 'Mission',
      title: next.title,
      subtitle: `${next.subtitle} · +${next.xp} XP`,
      cta: 'Do it',
      to: '/',
    };
  }
  return {
    kicker: 'You\'re ahead',
    title: 'Think about today',
    subtitle: 'Generate your mental diet · synthesize.',
    cta: 'Open',
    to: '/diet',
  };
}

function isDoneNow(task: CustomTask, checks: { [k: string]: { [id: string]: boolean } }): boolean {
  // Inline the period-key calc to avoid a domain import cycle.
  const now = new Date();
  let key: string;
  if (task.scope === 'daily') {
    key = `d-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  } else if (task.scope === 'monthly') {
    key = `m-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  } else {
    // Weekly — ISO week
    const t = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((t.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    key = `w-${t.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  }
  return !!checks[key]?.[task.id];
}

function greetingFor(h: number) {
  if (h < 5)  return 'Late Night';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return 'Tonight';
}
