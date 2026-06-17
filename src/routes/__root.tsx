import { useState } from 'react';
import { Outlet, createRootRouteWithContext, useRouterState, Link } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { Icon } from '@/ui/Icon';
import { Lock } from '@/auth/Lock';
import { isUnlocked } from '@/auth/passcode';

interface RouterCtx { queryClient: QueryClient }

export const Route = createRootRouteWithContext<RouterCtx>()({
  component: RootLayout,
});

// Tab bar — 5 verbs, one job each.
// URLs are legacy on /brain (it's now labeled Train); everything else maps cleanly.
const TABS = [
  { to: '/',         label: 'Today',   icon: 'sparkles'      },
  { to: '/brain',    label: 'Train',   icon: 'pencil'        },
  { to: '/mind',     label: 'Mind',    icon: 'brain'         },
  { to: '/library',  label: 'Library', icon: 'book'          },
  { to: '/me',       label: 'Me',      icon: 'circle-person' },
] as const;

function RootLayout() {
  const { location } = useRouterState();
  const path = location.pathname;
  const [unlocked, setUnlocked] = useState(() => isUnlocked());
  if (!unlocked) return <Lock onUnlocked={() => setUnlocked(true)} />;
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1 pb-[calc(env(safe-area-inset-bottom)+72px)]">
        <Outlet />
      </main>

      <nav
        className="tab-bar-blur fixed bottom-0 left-0 right-0 z-50 no-select"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex justify-around items-stretch pt-[6px] pb-[2px]">
          {TABS.map(t => {
            const active = t.to === '/' ? path === '/' : path.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className="flex flex-col items-center justify-center gap-[2px] flex-1 py-1 active:opacity-60 transition-opacity"
                style={{ color: active ? 'var(--tint)' : 'var(--label-tertiary)' }}
              >
                <Icon name={t.icon} size={26} />
                <span className="ios-caption-2 font-medium tracking-[0.01em]">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
