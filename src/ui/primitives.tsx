import { type ReactNode, type CSSProperties, forwardRef } from 'react';
import { Icon } from './Icon';

/* ─── LargeTitleHeader ──────────────────────────────────────
   iOS-style large title that collapses on scroll (visual only here).
   ─────────────────────────────────────────────────────────── */
export function LargeTitle({ title, trailing, subtitle }: { title: string; trailing?: ReactNode; subtitle?: ReactNode }) {
  return (
    <header className="safe-top px-5 pt-3 pb-2">
      <div className="flex items-end justify-between gap-3 min-h-[44px]">
        <h1 className="ios-large-title" style={{ color: 'var(--label)' }}>{title}</h1>
        {trailing}
      </div>
      {subtitle && <div className="mt-1">{subtitle}</div>}
    </header>
  );
}

/* ─── GroupedList ────────────────────────────────────────── */
export function ListGroup({ header, footer, children }: { header?: ReactNode; footer?: ReactNode; children: ReactNode }) {
  return (
    <section className="px-4 mb-6">
      {header && (
        <div className="px-4 mb-1.5 ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>
          {header}
        </div>
      )}
      <div className="ios-list">{children}</div>
      {footer && (
        <div className="px-4 mt-1.5 ios-footnote" style={{ color: 'var(--label-secondary)' }}>
          {footer}
        </div>
      )}
    </section>
  );
}

interface RowProps {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  onClick?: () => void;
  asLink?: boolean;
}
export const Row = forwardRef<HTMLDivElement, RowProps>(function Row(
  { leading, title, subtitle, trailing, chevron, onClick },
  ref
) {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`ios-row ${onClick ? 'active:bg-[color:var(--fill-tertiary)] cursor-pointer' : ''}`}
    >
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="flex-1 min-w-0">
        <div className="ios-body truncate" style={{ color: 'var(--label)' }}>{title}</div>
        {subtitle && (
          <div className="ios-footnote mt-0.5 truncate" style={{ color: 'var(--label-secondary)' }}>
            {subtitle}
          </div>
        )}
      </div>
      {trailing && <div className="shrink-0 ios-subheadline" style={{ color: 'var(--label-secondary)' }}>{trailing}</div>}
      {chevron && <Icon name="chevron-right" size={14} className="shrink-0" />}
    </div>
  );
});

/* ─── Card ─────────────────────────────────────────────── */
export function Card({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`rounded-[16px] p-4 ${className}`}
      style={{ background: 'var(--bg-grouped-secondary)', ...style }}
    >
      {children}
    </div>
  );
}

/* ─── Button (filled / tinted / plain) ─────────────────── */
type Variant = 'filled' | 'tinted' | 'plain' | 'gray';
export function Button({
  children, variant = 'filled', size = 'md', onClick, fullWidth, leading, trailing,
}: {
  children: ReactNode; variant?: Variant; size?: 'md' | 'lg'; onClick?: () => void; fullWidth?: boolean; leading?: ReactNode; trailing?: ReactNode;
}) {
  const styles: Record<Variant, CSSProperties> = {
    filled: { background: 'var(--tint)', color: 'white' },
    tinted: { background: 'var(--tint-secondary)', color: 'var(--tint)' },
    plain:  { background: 'transparent', color: 'var(--tint)' },
    gray:   { background: 'var(--fill)', color: 'var(--label)' },
  };
  const sizes = {
    md: 'h-[44px] px-4 ios-headline',
    lg: 'h-[50px] px-5 ios-headline',
  };
  return (
    <button
      onClick={onClick}
      className={`${sizes[size]} rounded-[12px] inline-flex items-center justify-center gap-1.5 active:opacity-70 transition-opacity no-select ${fullWidth ? 'w-full' : ''}`}
      style={styles[variant]}
    >
      {leading}
      {children}
      {trailing}
    </button>
  );
}

/* ─── Switch (iOS toggle) ──────────────────────────────── */
export function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      className="relative inline-flex h-[31px] w-[51px] rounded-full transition-colors no-select"
      style={{
        background: on ? 'var(--green)' : 'var(--fill)',
      }}
    >
      <span
        className="absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full transition-transform"
        style={{
          background: '#FFFFFF',
          transform: on ? 'translateX(20px)' : 'translateX(0)',
          boxShadow: '0 3px 8px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.10)',
        }}
      />
    </button>
  );
}

/* ─── SegmentedControl ─────────────────────────────────── */
export function Segmented<T extends string>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div
      className="p-[2px] rounded-[9px] inline-flex w-full no-select"
      style={{ background: 'var(--fill-tertiary)' }}
    >
      {options.map(o => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="flex-1 h-[28px] rounded-[7px] ios-subheadline font-medium transition-all"
            style={{
              background: on ? 'var(--bg-grouped-secondary)' : 'transparent',
              color: 'var(--label)',
              fontWeight: on ? 600 : 500,
              boxShadow: on ? '0 1px 0.5px rgba(0,0,0,0.12), 0 3px 8px rgba(0,0,0,0.04)' : 'none',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
