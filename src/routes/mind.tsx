import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, Card, ListGroup, Row } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';

export const Route = createFileRoute('/mind')({ component: Mind });

/**
 * MIND — the second brain.
 *
 * Surfaces the vault's life-domains as primary navigation. The vault folders
 * (01-CRAFT, 02-MIND, etc.) finally feel like categories of your life, not
 * cryptic numeric prefixes buried 3 taps deep.
 *
 * Plus the "process" tools that take incoming knowledge and turn it into vault
 * material: Mental Diet (generate a daily feed), Watch (transcribe a video),
 * Surprise Me (cross-domain connections), Journal (today's entry).
 */
function Mind() {
  return (
    <div>
      <LargeTitle
        title="Mind"
        subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>Your second brain</span>}
      />

      {/* PROCESS — the things that ADD to your brain */}
      <section className="px-4 mb-6">
        <div className="ios-footnote uppercase tracking-wide mb-2 px-1" style={{ color: 'var(--label-secondary)' }}>
          Process
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ProcessTile to="/diet"     color="var(--pink)"   icon="sparkles" label="Mental Diet" hint="Daily feed" />
          <ProcessTile to="/watch"    color="var(--teal)"   icon="sparkles" label="Watch"       hint="Video → notes" />
          <ProcessTile to="/surprise" color="var(--purple)" icon="brain"    label="Surprise"    hint="Cross-link" />
          <ProcessTile to="/journal"  color="var(--orange)" icon="pencil"   label="Journal"     hint="Today's entry" />
        </div>
      </section>

      {/* LIFE DOMAINS — the vault folders, surfaced as primary nav */}
      <section className="px-4 mb-4">
        <div className="ios-footnote uppercase tracking-wide mb-2 px-1" style={{ color: 'var(--label-secondary)' }}>
          Life domains
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Domain path="02-MIND"   color="#5856D6" emoji="🧠" label="Mind"   />
          <Domain path="06-BODY"   color="#FF3B30" emoji="💪" label="Body"   />
          <Domain path="01-CRAFT"  color="#FF9500" emoji="✍️" label="Craft"  />
          <Domain path="03-OPS"    color="#34C759" emoji="⚙️" label="Ops"    />
          <Domain path="04-GAME"   color="#AF52DE" emoji="🎮" label="Game"   />
          <Domain path="09-LIFE"   color="#FF2D55" emoji="🌱" label="Life"   />
          <Domain path="07-SWIPE"  color="#00C7BE" emoji="💎" label="Swipe"  />
          <Domain path="08-LIBRARY" color="#5AC8FA" emoji="📚" label="Library"/>
          <Domain path="00-INBOX"  color="#8E8E93" emoji="📥" label="Inbox"  />
        </div>
      </section>

      {/* Reference docs that aren't life domains */}
      <ListGroup header="Reference">
        <Link to="/note/$" params={{ _splat: '_OBSIDIAN-DASHBOARD.md' }}>
          <Row leading={<Mini icon="house" color="var(--tint)" />}   title="Dashboard"     subtitle="Live Obsidian view" chevron />
        </Link>
        <Link to="/note/$" params={{ _splat: '_TAGS.md' }}>
          <Row leading={<Mini icon="doc-text" color="var(--gray)" />} title="Tag taxonomy" subtitle="3-family system"  chevron />
        </Link>
        <Link to="/note/$" params={{ _splat: '_OBSIDIAN-SETUP.md' }}>
          <Row leading={<Mini icon="gear" color="var(--gray)" />}    title="Obsidian setup" subtitle="2-click bootstrap" chevron />
        </Link>
      </ListGroup>
    </div>
  );
}

function ProcessTile({ to, color, icon, label, hint }: { to: any; color: string; icon: any; label: string; hint: string }) {
  return (
    <Link to={to}>
      <div className="rounded-[12px] p-3 active:scale-[0.97] transition-transform"
           style={{ background: 'var(--bg-grouped-secondary)' }}>
        <div className="w-9 h-9 rounded-[9px] flex items-center justify-center mb-2"
             style={{ background: color, color: 'white' }}>
          <Icon name={icon} size={18} />
        </div>
        <div className="ios-headline" style={{ color: 'var(--label)' }}>{label}</div>
        <div className="ios-footnote" style={{ color: 'var(--label-secondary)' }}>{hint}</div>
      </div>
    </Link>
  );
}

function Domain({ path, color, emoji, label }: { path: string; color: string; emoji: string; label: string }) {
  return (
    <Link to="/folder/$" params={{ _splat: path }}>
      <div className="rounded-[14px] py-4 flex flex-col items-center gap-1 active:scale-[0.96] transition-transform relative overflow-hidden"
           style={{ background: 'var(--bg-grouped-secondary)' }}>
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: color }}
        />
        <div className="text-3xl leading-none" aria-hidden>{emoji}</div>
        <div className="ios-footnote font-semibold mt-1" style={{ color: 'var(--label)' }}>{label}</div>
      </div>
    </Link>
  );
}

function Mini({ icon, color }: { icon: any; color: string }) {
  return (
    <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ background: color, color: 'white' }}>
      <Icon name={icon} size={16} />
    </div>
  );
}
