/**
 * Vault filesystem abstraction.
 * The SOVEREIGN Obsidian vault IS the database — every screen reads/writes
 * markdown files through this single interface.
 *
 * Two implementations:
 *   - WebAdapter (dev): in-memory sample vault + optional File System
 *     Access API when available (Chromium desktop).
 *   - CapacitorAdapter (iOS): @capacitor/filesystem against the configured
 *     root, which defaults to iCloud-synced Documents.
 *
 * Selection happens once at startup based on Capacitor.isNativePlatform().
 */
export interface VaultAdapter {
  /** List file paths inside a folder (recursive). Paths are vault-relative, posix style. */
  list(folder: string): Promise<string[]>;
  /** Read a file as UTF-8 string. Throws if missing. */
  read(path: string): Promise<string>;
  /** Write/overwrite a file. Creates parent folders if needed. */
  write(path: string, content: string): Promise<void>;
  /** Does a file exist at this path? */
  exists(path: string): Promise<boolean>;
}

let _adapter: VaultAdapter | null = null;

export async function getVault(): Promise<VaultAdapter> {
  if (_adapter) return _adapter;
  // Capacitor.isNativePlatform() requires the runtime import.
  const { Capacitor } = await import('@capacitor/core');
  if (Capacitor.isNativePlatform()) {
    const { CapacitorAdapter } = await import('./adapter.capacitor');
    _adapter = new CapacitorAdapter();
  } else {
    const { WebAdapter } = await import('./adapter.web');
    _adapter = new WebAdapter();
  }
  return _adapter;
}
