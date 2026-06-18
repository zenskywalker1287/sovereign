/**
 * SOVEREIGN persistent state.
 *
 * One Zustand store, persisted to localStorage. Holds:
 *   - missions:    per-date {missionId → checked} map
 *   - archetypes:  {slug → xp} map (level is computed)
 *   - stats:       lifetime totals + streak + last active date
 *   - profile:     name, joined date
 *
 * Aura % and "today's missions" are derived selectors, not stored.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_DAILY_MISSIONS, type DailyMission } from './missions';
import { DEFAULT_ARCHETYPES, type ArchetypeSlug, xpForLevel, levelForXp } from './archetypes';
import { type CustomTask, type TaskScope, newTaskId, periodKey } from './tasks';

const todayKey = () => new Date().toISOString().slice(0, 10);

export interface MissionCheckMap { [missionId: string]: boolean }

// Stable module-scope empty references. Returning a fresh `{}` from a Zustand
// selector each render breaks reference equality and triggers an infinite render
// loop ("Maximum update depth exceeded"). Use these constants instead.
const EMPTY_CHECKS: MissionCheckMap = Object.freeze({});

interface SovereignState {
  /* persisted */
  profile: { name: string; joinedAt: string };
  missionChecks: { [yyyymmdd: string]: MissionCheckMap };  // per-day completion of DEFAULT missions
  archetypeXp: Record<ArchetypeSlug, number>;
  stats: {
    lifetimeXp: number;
    drillsCompleted: number;
    wordsWritten: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;  // yyyy-mm-dd
  };
  voltageLog: { date: string; activity: string; voltage: number; notes?: string }[];
  /** Per-speech-drill completion log. Key = speech drill id, value = total times done. */
  speechProgress: { [drillId: string]: number };
  /** Last date the user completed any speech drill — for streak math. */
  speechLastDate: string | null;
  customTasks: CustomTask[];
  /** Keyed by `periodKey(scope)` like 'd-2026-06-17', 'w-2026-W25', 'm-2026-06'. */
  customTaskChecks: { [periodKey: string]: { [taskId: string]: boolean } };

  /* actions */
  toggleMission: (missionId: string) => void;
  isMissionDone: (missionId: string) => boolean;
  todayMissions: () => DailyMission[];
  todayChecks: () => MissionCheckMap;
  awardDrillCompletion: (input: { archetype: ArchetypeSlug; xp: number; words: number }) => void;
  tickActivity: () => void;
  recordVoltage: (activity: string, voltage: number, notes?: string) => void;
  resetAll: () => void;
  /* custom-task actions */
  addCustomTask: (input: { title: string; scope: TaskScope; xp?: number; archetype?: ArchetypeSlug; subtitle?: string }) => CustomTask;
  removeCustomTask: (id: string) => void;
  toggleCustomTask: (id: string) => void;
  isCustomTaskDone: (id: string) => boolean;
  /** Read tasks for a scope. */
  tasksOfScope: (scope: TaskScope) => CustomTask[];
  /** Speech drill completion — also awards XP to Leader. */
  completeSpeechDrill: (drillId: string, xp?: number) => void;
}

const EMPTY_TASK_CHECKS: { [taskId: string]: boolean } = Object.freeze({});

const initial = (): Omit<SovereignState,
  | 'toggleMission' | 'isMissionDone' | 'todayMissions' | 'todayChecks'
  | 'awardDrillCompletion' | 'tickActivity' | 'recordVoltage' | 'resetAll'
  | 'addCustomTask' | 'removeCustomTask' | 'toggleCustomTask' | 'isCustomTaskDone' | 'tasksOfScope'
  | 'completeSpeechDrill'
> => ({
  profile: { name: 'Zatreides', joinedAt: todayKey() },
  missionChecks: {},
  archetypeXp: DEFAULT_ARCHETYPES.reduce((acc, a) => ({ ...acc, [a.slug]: a.seedXp ?? 0 }), {} as Record<ArchetypeSlug, number>),
  stats: { lifetimeXp: 0, drillsCompleted: 0, wordsWritten: 0, currentStreak: 0, longestStreak: 0, lastActiveDate: null },
  voltageLog: [],
  speechProgress: {},
  speechLastDate: null,
  customTasks: [],
  customTaskChecks: {},
});

export const useStore = create<SovereignState>()(
  persist(
    (set, get) => ({
      ...initial(),

      toggleMission: (missionId) => {
        const day = todayKey();
        set((s) => {
          const dayMap = { ...(s.missionChecks[day] ?? {}) };
          dayMap[missionId] = !dayMap[missionId];
          return { missionChecks: { ...s.missionChecks, [day]: dayMap } };
        });
        get().tickActivity();
      },

      isMissionDone: (missionId) => {
        return !!get().missionChecks[todayKey()]?.[missionId];
      },

      todayMissions: () => DEFAULT_DAILY_MISSIONS,

      todayChecks: () => get().missionChecks[todayKey()] ?? EMPTY_CHECKS,

      awardDrillCompletion: ({ archetype, xp, words }) => {
        set((s) => ({
          archetypeXp: { ...s.archetypeXp, [archetype]: (s.archetypeXp[archetype] ?? 0) + xp },
          stats: {
            ...s.stats,
            lifetimeXp: s.stats.lifetimeXp + xp,
            drillsCompleted: s.stats.drillsCompleted + 1,
            wordsWritten: s.stats.wordsWritten + words,
          },
        }));
        get().tickActivity();
      },

      tickActivity: () => {
        const today = todayKey();
        set((s) => {
          const last = s.stats.lastActiveDate;
          if (last === today) return s;
          let streak = s.stats.currentStreak;
          if (last) {
            const lastMs = new Date(last).getTime();
            const todayMs = new Date(today).getTime();
            const daysApart = Math.round((todayMs - lastMs) / 86_400_000);
            streak = daysApart === 1 ? streak + 1 : 1;
          } else {
            streak = 1;
          }
          return {
            stats: {
              ...s.stats,
              currentStreak: streak,
              longestStreak: Math.max(s.stats.longestStreak, streak),
              lastActiveDate: today,
            },
          };
        });
      },

      recordVoltage: (activity, voltage, notes) => {
        set((s) => ({
          voltageLog: [{ date: todayKey(), activity, voltage, notes }, ...s.voltageLog].slice(0, 500),
        }));
        get().tickActivity();
      },

      resetAll: () => set(() => ({ ...initial() })),

      /* ────────────── Custom tasks ────────────── */

      addCustomTask: ({ title, scope, xp = 25, archetype = 'executor', subtitle }) => {
        const t: CustomTask = {
          id: newTaskId(),
          title: title.trim(),
          subtitle: subtitle?.trim() || undefined,
          scope,
          xp,
          archetype,
          createdAt: todayKey(),
        };
        set((s) => ({ customTasks: [...s.customTasks, t] }));
        return t;
      },

      removeCustomTask: (id) => {
        set((s) => {
          // Drop the task + clean any check entries pointing at it.
          const customTasks = s.customTasks.filter(t => t.id !== id);
          const customTaskChecks: SovereignState['customTaskChecks'] = {};
          for (const [k, map] of Object.entries(s.customTaskChecks)) {
            const next: { [id: string]: boolean } = {};
            for (const [tid, v] of Object.entries(map)) if (tid !== id) next[tid] = v;
            if (Object.keys(next).length) customTaskChecks[k] = next;
          }
          return { customTasks, customTaskChecks };
        });
      },

      toggleCustomTask: (id) => {
        const task = get().customTasks.find(t => t.id === id);
        if (!task) return;
        const key = periodKey(task.scope);
        const wasDone = !!get().customTaskChecks[key]?.[id];
        set((s) => {
          const cur = { ...(s.customTaskChecks[key] ?? {}) };
          if (wasDone) delete cur[id];
          else cur[id] = true;
          return { customTaskChecks: { ...s.customTaskChecks, [key]: cur } };
        });
        if (!wasDone) {
          // Newly completed → award XP to mapped archetype.
          set((s) => ({
            archetypeXp: { ...s.archetypeXp, [task.archetype]: (s.archetypeXp[task.archetype] ?? 0) + task.xp },
            stats: { ...s.stats, lifetimeXp: s.stats.lifetimeXp + task.xp },
          }));
        } else {
          // Un-checking — reverse the XP grant.
          set((s) => ({
            archetypeXp: { ...s.archetypeXp, [task.archetype]: Math.max(0, (s.archetypeXp[task.archetype] ?? 0) - task.xp) },
            stats: { ...s.stats, lifetimeXp: Math.max(0, s.stats.lifetimeXp - task.xp) },
          }));
        }
        get().tickActivity();
      },

      isCustomTaskDone: (id) => {
        const task = get().customTasks.find(t => t.id === id);
        if (!task) return false;
        return !!get().customTaskChecks[periodKey(task.scope)]?.[id];
      },

      tasksOfScope: (scope) => get().customTasks.filter(t => t.scope === scope),

      completeSpeechDrill: (drillId, xp = 50) => {
        const today = todayKey();
        set((s) => ({
          speechProgress: { ...s.speechProgress, [drillId]: (s.speechProgress[drillId] ?? 0) + 1 },
          speechLastDate: today,
          archetypeXp: { ...s.archetypeXp, leader: (s.archetypeXp.leader ?? 0) + xp },
          stats: {
            ...s.stats,
            lifetimeXp: s.stats.lifetimeXp + xp,
            drillsCompleted: s.stats.drillsCompleted + 1,
          },
        }));
        get().tickActivity();
      },
    }),
    {
      name: 'sovereign.store.v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        profile: s.profile,
        missionChecks: s.missionChecks,
        archetypeXp: s.archetypeXp,
        stats: s.stats,
        voltageLog: s.voltageLog,
        speechProgress: s.speechProgress,
        speechLastDate: s.speechLastDate,
        customTasks: s.customTasks,
        customTaskChecks: s.customTaskChecks,
      }),
      // Bumping `version` discards any older persisted state — anyone loading the
      // app picks up fresh zeros. Bump again for any future state-shape change.
      version: 2,
    }
  )
);

/* ───────────────────── Derived selectors ───────────────────── */

/** Aura % from today's completion ratio (60%) + streak progress (40%). 0–100. */
export function selectAuraPct(s: SovereignState): number {
  const todayMs = s.todayMissions();
  const checks = s.todayChecks();
  const done = todayMs.filter(m => checks[m.id]).length;
  const total = todayMs.length;
  const completionRatio = total > 0 ? done / total : 0;
  const streakProgress = Math.min(s.stats.currentStreak, 30) / 30;
  return Math.round(Math.min(100, completionRatio * 60 + streakProgress * 40));
}

/** Bucketed aura label. */
export function selectAuraLabel(pct: number): string {
  if (pct >= 90) return 'Dialed';
  if (pct >= 71) return 'Locked In';
  if (pct >= 41) return 'Engaged';
  return 'Drifting';
}

export function selectXpForLevel(n: number): number { return xpForLevel(n); }
export function selectLevelForXp(xp: number): { level: number; xpInLevel: number; xpToNext: number } { return levelForXp(xp); }
