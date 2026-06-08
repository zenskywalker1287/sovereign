/**
 * Daily mission catalog — the 5 archetypes of daily action from the Daily
 * Command Center. Each maps to one of the 5 character archetypes for XP
 * routing when checked off.
 */
import type { ArchetypeSlug } from './archetypes';

export interface DailyMission {
  id: string;
  title: string;
  subtitle: string;
  xp: number;
  archetype: ArchetypeSlug;
  icon: 'flame' | 'book' | 'sparkles' | 'brain' | 'pencil';
}

export const DEFAULT_DAILY_MISSIONS: DailyMission[] = [
  { id: 'body',    title: 'Train the Body',     subtitle: 'Workout · 45 min', xp: 75, archetype: 'warrior',  icon: 'flame'    },
  { id: 'mind',    title: 'Train the Mind',     subtitle: 'Read 20 pages',    xp: 40, archetype: 'maestro',  icon: 'book'     },
  { id: 'brand',   title: 'Build the Brand',    subtitle: 'Work on content',  xp: 90, archetype: 'creator',  icon: 'sparkles' },
  { id: 'inner',   title: 'Control the Inner',  subtitle: 'Meditate 15 min',  xp: 30, archetype: 'leader',   icon: 'brain'    },
  { id: 'reflect', title: 'Reflection',         subtitle: 'Journal your day', xp: 25, archetype: 'executor', icon: 'pencil'   },
];

export function findMission(id: string): DailyMission | undefined {
  return DEFAULT_DAILY_MISSIONS.find(m => m.id === id);
}
