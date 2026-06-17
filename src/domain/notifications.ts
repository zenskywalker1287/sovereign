/**
 * Local notification preferences + permission-aware fire/test helpers.
 *
 * v1 scope: client-side only (no push service backend). Stores preferences
 * in localStorage. If the browser supports the Notification API and the user
 * granted permission, we can fire a notification immediately (test) or schedule
 * one for later via setTimeout (works only while the app is open — fine for
 * "tap a reminder during a writing session" cases, not for true background push).
 *
 * Real cross-device background push needs a Vercel/Cloudflare push service.
 * Deferred.
 */
export interface NotifPrefs {
  enabled: boolean;
  reminderTime: string;  // HH:MM (24h)
}
const KEY = 'sovereign.notifications.prefs.v1';

export function getNotifPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch {}
  return defaults();
}
export function saveNotifPrefs(p: Partial<NotifPrefs>) {
  const merged = { ...getNotifPrefs(), ...p };
  localStorage.setItem(KEY, JSON.stringify(merged));
}
function defaults(): NotifPrefs { return { enabled: false, reminderTime: '07:30' }; }

export type Permission = 'default' | 'granted' | 'denied' | 'unavailable';

export function permission(): Permission {
  if (typeof Notification === 'undefined') return 'unavailable';
  return Notification.permission as Permission;
}

export async function requestPermission(): Promise<Permission> {
  if (typeof Notification === 'undefined') return 'unavailable';
  const result = await Notification.requestPermission();
  return result as Permission;
}

export function fireTest() {
  if (permission() !== 'granted') return;
  new Notification('SOVEREIGN', {
    body: 'Notifications are working. Locked in.',
    icon: '/sovereign/icon-192.png',
    badge: '/sovereign/icon-192.png',
  });
}

/** Schedule the next-best-effort daily reminder while the tab is open. */
export function scheduleDaily() {
  if (permission() !== 'granted') return;
  const prefs = getNotifPrefs();
  if (!prefs.enabled) return;
  const [h, m] = prefs.reminderTime.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(h ?? 7, m ?? 30, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next.getTime() - now.getTime();
  setTimeout(() => {
    new Notification('SOVEREIGN', {
      body: "Today's missions are waiting. Open the app and lock in.",
      icon: '/sovereign/icon-192.png',
    });
    scheduleDaily();  // re-arm for tomorrow
  }, delay);
}
