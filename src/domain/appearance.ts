/**
 * Theme preference: 'light' | 'dark' | 'system'.
 * Applied via data-theme attribute on document.documentElement.
 * 'system' = let the iOS tokens follow prefers-color-scheme automatically (no attr).
 */
export type ThemePref = 'light' | 'dark' | 'system';
const KEY = 'sovereign.appearance.theme';

export function getTheme(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {}
  return 'system';
}

export function setTheme(t: ThemePref) {
  localStorage.setItem(KEY, t);
  applyTheme(t);
}

export function applyTheme(t: ThemePref = getTheme()) {
  const root = document.documentElement;
  if (t === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', t);
}
