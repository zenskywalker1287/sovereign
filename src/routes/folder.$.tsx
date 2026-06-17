import { useEffect, useState } from 'react';
import { createFileRoute, useParams, Link } from '@tanstack/react-router';
import { LargeTitle, ListGroup, Row } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { getVault } from '@/vault/adapter';

// Generic vault folder browser. Path is the catch-all $splat so we can route
// to /folder/01-CRAFT, /folder/01-CRAFT/writing/graded, etc.
export const Route = createFileRoute('/folder/$')({ component: FolderBrowser });

function FolderBrowser() {
  const { _splat } = useParams({ from: '/folder/$' }) as { _splat: string };
  const folder = decodeURIComponent(_splat ?? '').replace(/\/$/, '');
  const [files, setFiles] = useState<string[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const vault = await getVault();
        const list = await vault.list(folder + '/');
        setFiles(list.filter(p => p.endsWith('.md')).sort());
      } catch (e: any) {
        setErr(e?.message ?? 'Could not read folder');
      }
    })();
  }, [folder]);

  const breadcrumbs = folder.split('/').filter(Boolean);

  return (
    <div>
      <LargeTitle
        title={breadcrumbs[breadcrumbs.length - 1] || folder || 'Vault'}
        subtitle={
          <span className="ios-footnote font-mono" style={{ color: 'var(--label-secondary)' }}>{folder || '/'}</span>
        }
        trailing={<Link to="/brain" className="ios-headline" style={{ color: 'var(--tint)' }}>Done</Link>}
      />

      {err && (
        <div className="mx-4 mb-4 p-4 rounded-[12px] ios-callout"
             style={{ background: 'color-mix(in srgb, var(--red) 12%, transparent)', color: 'var(--red)' }}>
          {err}
        </div>
      )}

      {files === null && !err && (
        <div className="px-4 py-6 ios-body" style={{ color: 'var(--label-secondary)' }}>Loading…</div>
      )}

      {files?.length === 0 && (
        <div className="px-4 py-12 text-center">
          <div className="ios-headline" style={{ color: 'var(--label)' }}>Empty folder</div>
          <div className="ios-footnote mt-1" style={{ color: 'var(--label-secondary)' }}>
            Notes you write here will show up.
          </div>
        </div>
      )}

      {files && files.length > 0 && (
        <ListGroup header={`${files.length} notes`}>
          {files.map(path => (
            <Link key={path} to="/note/$" params={{ _splat: path }}>
              <Row
                leading={
                  <div className="w-9 h-9 rounded-[8px] flex items-center justify-center"
                       style={{ background: 'var(--fill-tertiary)' }}>
                    <Icon name="doc-text" size={16} />
                  </div>
                }
                title={path.split('/').pop()!.replace('.md', '')}
                subtitle={path.split('/').slice(0, -1).join('/')}
                chevron
              />
            </Link>
          ))}
        </ListGroup>
      )}
    </div>
  );
}
