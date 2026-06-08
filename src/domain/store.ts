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

const todayKey = () => new Date().toISOString().slice(0, 10);

export interface MissionCheckMap { [missionId: string]: boolean }

interface SovereignState {
  /* persisted */
  profile: { name: string; joinedAt: string };
  missionChecks: { [yyyymmdd: string]: MissionCheckMap };  // per-day completion
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

  /* actions */
  toggleMission: (missionId: string) => void;
  isMissionDone: (missionId: string) => boolean;
  todayMissions: () => DailyMission[];
  todayChecks: () => MissionCheckMap;
  awardDrillCompletion: (input: { archetype: ArchetypeSlug; xp: number; words: number }) => void;
  tickActivity: () => void; // bumps streak / lastActiveDate when user does something meaningful
  recordVoltage: (activity: string, voltage: number, notes?: string) => void;
  resetAll: () => void;
}

const initial = (): Omit<SovereignState,
  | 'toggleMission' | 'isMissionDone' | 'todayMissions' | 'todayChecks'
  | 'awardDrillCompletion' | 'tickActivity' | 'recordVoltage' | 'resetAll'
> => ({
  profile: { name: 'Zatreides', joinedAt: todayKey() },
  missionChecks: {},
  archetypeXp: DEFAULT_ARCHETYPES.reduce((acc, a) => ({ ...acc, [a.slug]: a.seedXp ?? 0 }), {} as Record<ArchetypeSlug, number>),
  stats: { lifetimeXp: 0, drillsCompleted: 0, wordsWritten: 0, currentStreak: 0, longestStreak: 0, lastActiveDate: null },
  voltageLog: [],
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

      todayChecks: () => get().missionChecks[todayKey()] ?? {},

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
      }),
      version: 1,
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
