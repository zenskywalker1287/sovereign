/**
 * iOS-style stroke icons. SF Symbols-inspired but rendered as inline SVG
 * so they tint via currentColor.
 */
type IconName =
  | 'house' | 'checklist' | 'person-fill' | 'brain' | 'circle-person'
  | 'chevron-right' | 'chevron-left' | 'plus' | 'ellipsis' | 'sparkles'
  | 'doc-text' | 'timer' | 'check' | 'pencil' | 'arrow-right' | 'flame'
  | 'book' | 'gear' | 'arrow-up';

export function Icon({ name, size = 22, className = '' }: { name: IconName; size?: number; className?: string }) {
  const p = (d: string, fill = false) => (
    <path d={d} fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
  );
  const wrap = (children: React.ReactNode) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      {children}
    </svg>
  );
  switch (name) {
    case 'house':         return wrap(p('M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9.5z'));
    case 'checklist':     return wrap(<>{p('M9 11l2 2 4-4')}{p('M3 6h2M3 12h2M3 18h2')}{p('M9 6h12M9 18h12')}</>);
    case 'person-fill':   return wrap(<>{p('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', true)}{p('M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6', true)}</>);
    case 'brain':         return wrap(p('M9.5 4A2.5 2.5 0 0 0 7 6.5v.5a3 3 0 0 0-1 5.83V14a3 3 0 0 0 3 3v.5a2.5 2.5 0 0 0 5 0V17a3 3 0 0 0 3-3v-1.17A3 3 0 0 0 16 7v-.5A2.5 2.5 0 0 0 13.5 4 2.5 2.5 0 0 0 12 5a2.5 2.5 0 0 0-2.5-1z'));
    case 'circle-person': return wrap(<>{p('M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z')}{p('M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z')}{p('M6.5 19a6 6 0 0 1 11 0')}</>);
    case 'chevron-right': return wrap(p('M9 6l6 6-6 6'));
    case 'chevron-left':  return wrap(p('M15 6l-6 6 6 6'));
    case 'plus':          return wrap(p('M12 5v14M5 12h14'));
    case 'ellipsis':      return wrap(<>{p('M6 12h.01M12 12h.01M18 12h.01', true)}</>);
    case 'sparkles':      return wrap(p('M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M5.5 18.5l2-2M16.5 7.5l2-2M9 12l3-3 3 3-3 3-3-3z'));
    case 'doc-text':      return wrap(<>{p('M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z')}{p('M14 3v6h6')}{p('M8 13h8M8 17h6M8 9h2')}</>);
    case 'timer':         return wrap(<>{p('M10 2h4')}{p('M12 14V8')}{p('M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16z')}</>);
    case 'check':         return wrap(p('M5 12l5 5L20 7'));
    case 'pencil':        return wrap(p('M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'));
    case 'arrow-right':   return wrap(p('M5 12h14M13 5l7 7-7 7'));
    case 'arrow-up':      return wrap(p('M12 19V5M5 12l7-7 7 7'));
    case 'flame':         return wrap(p('M12 22c4 0 7-3 7-7 0-3-2-5-2-7 0 1-1 2-3 2 0-4-3-7-3-7s-1 4-3 6c-2 2-3 4-3 6 0 4 3 7 7 7z'));
    case 'book':          return wrap(p('M4 4h8a4 4 0 0 1 4 4v13H8a4 4 0 0 1-4-4V4zM20 4h-4a4 4 0 0 0-4 4v13h4a4 4 0 0 0 4-4V4z'));
    case 'gear':          return wrap(<>{p('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z')}{p('M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z')}</>);
  }
}
