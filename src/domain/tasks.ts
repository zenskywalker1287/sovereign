/**
 * Custom user tasks — daily / weekly / monthly.
 *
 * Default missions (Train the Body, etc.) stay where they are. Custom tasks
 * live alongside them: daily ones show inline on Today; weekly + monthly get
 * their own sections.
 *
 * Persistence: completion is keyed by (period-key, task-id). Period keys:
 *   - daily   d-YYYY-MM-DD       — resets daily
 *   - weekly  w-YYYY-Www         — resets Monday (ISO 8601 week)
 *   - monthly m-YYYY-MM          — resets on the 1st
 */
import type { ArchetypeSlug } from './archetypes';

export type TaskScope = 'daily' | 'weekly' | 'monthly';

export interface CustomTask {
  id: string;
  title: string;
  subtitle?: string;
  scope: TaskScope;
  xp: number;
  archetype: ArchetypeSlug;
  createdAt: string;  // YYYY-MM-DD
}

export function newTaskId(): string {
  return 't_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Current period key for a given scope, computed from `now`. */
export function periodKey(scope: TaskScope, now: Date = new Date()): string {
  switch (scope) {
    case 'daily':   return `d-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    case 'weekly':  return `w-${isoYearWeek(now)}`;
    case 'monthly': return `m-${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  }
}

/** ISO-8601 year + week, e.g. "2026-W25". Week starts Monday; week 1 contains
 *  the first Thursday of the year. */
function isoYearWeek(d: Date): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((t.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${t.getUTCFullYear()}-W${pad(weekNum)}`;
}

export const SCOPE_LABEL: Record<TaskScope, string> = {
  daily:   'Today',
  weekly:  'This week',
  monthly: 'This month',
};
