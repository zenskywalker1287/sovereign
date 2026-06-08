/**
 * Client-side passcode gate. NOT cryptographic security — this is a
 * "stop the random URL stumbler" lock. A 4–8 digit PIN is hashed with
 * a per-install random salt via SHA-256 (Web Crypto), stored in
 * localStorage. After 5 wrong attempts in a row, lockout for 30 sec.
 *
 * Threat model: someone with the URL but not the device, or someone
 * who picks up an unlocked phone. NOT: an attacker with localStorage
 * read access. For real security, use a server.
 */
const HASH_KEY    = 'sovereign.auth.passcodeHash';
const SALT_KEY    = 'sovereign.auth.salt';
const FAILED_KEY  = 'sovereign.auth.failedCount';
const LOCKOUT_KEY = 'sovereign.auth.lockoutUntilMs';
const SESSION_KEY = 'sovereign.auth.unlockedAtMs';

export const LOCKOUT_AFTER_FAILS = 5;
export const LOCKOUT_DURATION_MS = 30_000;

function randHex(bytes = 16): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
}

export function isPasscodeSet(): boolean {
  return !!localStorage.getItem(HASH_KEY) && !!localStorage.getItem(SALT_KEY);
}

export async function setPasscode(pin: string): Promise<void> {
  if (!/^\d{4,8}$/.test(pin)) throw new Error('Passcode must be 4–8 digits.');
  const salt = randHex();
  const hash = await sha256(salt + pin);
  localStorage.setItem(SALT_KEY, salt);
  localStorage.setItem(HASH_KEY, hash);
  localStorage.removeItem(FAILED_KEY);
  localStorage.removeItem(LOCKOUT_KEY);
  markUnlocked();
}

export function lockoutRemainingMs(): number {
  const until = Number(localStorage.getItem(LOCKOUT_KEY) || '0');
  return until > Date.now() ? until - Date.now() : 0;
}

export async function verifyPasscode(pin: string): Promise<boolean> {
  if (lockoutRemainingMs() > 0) return false;
  const salt = localStorage.getItem(SALT_KEY);
  const hash = localStorage.getItem(HASH_KEY);
  if (!salt || !hash) return false;
  const test = await sha256(salt + pin);
  if (test === hash) {
    localStorage.removeItem(FAILED_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
    markUnlocked();
    return true;
  }
  const failed = Number(localStorage.getItem(FAILED_KEY) || '0') + 1;
  localStorage.setItem(FAILED_KEY, String(failed));
  if (failed >= LOCKOUT_AFTER_FAILS) {
    localStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_DURATION_MS));
    localStorage.setItem(FAILED_KEY, '0');
  }
  return false;
}

export function failedAttempts(): number {
  return Number(localStorage.getItem(FAILED_KEY) || '0');
}

function markUnlocked() {
  sessionStorage.setItem(SESSION_KEY, String(Date.now()));
}

/** Is this session unlocked? Uses sessionStorage so closing the tab/app re-locks. */
export function isUnlocked(): boolean {
  return !!sessionStorage.getItem(SESSION_KEY);
}

export function lock() {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Nuclear option: blow away all SOVEREIGN local data and start fresh. */
export function wipeAllData(): void {
  const keys = Object.keys(localStorage);
  for (const k of keys) {
    if (k.startsWith('sovereign.')) localStorage.removeItem(k);
  }
  sessionStorage.clear();
}
