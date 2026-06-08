import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import type { VaultAdapter } from './adapter';

/**
 * iOS adapter using Capacitor Filesystem.
 *
 * Vault root path: app config (default 'SOVEREIGN/') under
 * Directory.Documents. With the iCloud entitlement enabled in Xcode
 * (iCloud Documents → container iCloud.com.zatreides.sovereign), this
 * directory is automatically iCloud-synced and visible in the Files app
 * + Obsidian's "Open from iCloud Drive" picker.
 *
 * If/when the vault is migrated to the standard iCloud Drive container,
 * we point this at that location instead — the API surface stays identical.
 */
const ROOT = 'SOVEREIGN';

function full(path: string): string {
  if (path.startsWith('/')) path = path.slice(1);
  return `${ROOT}/${path}`;
}

export class CapacitorAdapter implements VaultAdapter {
  async list(folder: string): Promise<string[]> {
    const result = await Filesystem.readdir({
      path: full(folder),
      directory: Directory.Documents,
    });
    const files: string[] = [];
    for (const f of result.files) {
      const sub = `${folder.replace(/\/$/, '')}/${f.name}`;
      if (f.type === 'directory') {
        files.push(...await this.list(sub));
      } else {
        files.push(sub.replace(/^\//, ''));
      }
    }
    return files;
  }
  async read(path: string): Promise<string> {
    const result = await Filesystem.readFile({
      path: full(path),
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    return typeof result.data === 'string' ? result.data : await (result.data as Blob).text();
  }
  async write(path: string, content: string): Promise<void> {
    await Filesystem.writeFile({
      path: full(path),
      directory: Directory.Documents,
      data: content,
      encoding: Encoding.UTF8,
      recursive: true,
    });
  }
  async exists(path: string): Promise<boolean> {
    try {
      await Filesystem.stat({ path: full(path), directory: Directory.Documents });
      return true;
    } catch {
      return false;
    }
  }
}
