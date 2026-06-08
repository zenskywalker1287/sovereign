import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, ListGroup, Row, Card } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';

export const Route = createFileRoute('/brain')({ component: Brain });

function Brain() {
  return (
    <div>
      <LargeTitle title="Brain" subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>Writing Studio + the vault</span>} />

      {/* Writing Studio hero */}
      <section className="px-4 mb-6">
        <Card>
          <div className="ios-footnote uppercase tracking-wide mb-1" style={{ color: 'var(--label-secondary)' }}>Writing Studio</div>
          <div className="ios-title-2 mb-3" style={{ color: 'var(--label)' }}>Pick a drill. Write. Get graded.</div>
          <div className="grid grid-cols-3 gap-2">
            <LaneTile to="/brain/studio/fiction"  emoji="✦" label="Fiction" />
            <LaneTile to="/brain/studio/copy"     emoji="◆" label="Copy"    />
            <LaneTile to="/brain/studio/freeform" emoji="●" label="Freeform"/>
          </div>
        </Card>
      </section>

      {/* Bootcamps */}
      <ListGroup header="Author Bootcamps">
        <Row
          leading={<TileIcon name="book" color="var(--purple)" />}
          title="Stephenie Meyer"
          subtitle="Fiction · interiority + restraint · Lvl 3"
          chevron
          onClick={() => {}}
        />
        <Row
          leading={<TileIcon name="flame" color="var(--red)" />}
          title="Gary Halbert"
          subtitle="Copy · headlines + grabbers · Lvl 1"
          chevron
          onClick={() => {}}
        />
      </ListGroup>

      {/* Graded History */}
      <ListGroup header="Recent Grades">
        <Row title="2026-05-28  Halbert headline drill" trailing="84/100" subtitle="Weakest: specificity" chevron onClick={() => {}} />
        <Row title="2026-05-27  Meyer interiority"      trailing="76/100" subtitle="Weakest: rhythm"      chevron onClick={() => {}} />
        <Row title="2026-05-26  Freeform morning pages" trailing="—"      subtitle="Ungraded"             chevron onClick={() => {}} />
      </ListGroup>

      {/* Vault folders */}
      <ListGroup header="Vault">
        <Row leading={<FolderIcon color="var(--orange)" />} title="01-CRAFT"   subtitle="Writing, copy, scripts" chevron onClick={() => {}} />
        <Row leading={<FolderIcon color="var(--green)" />}  title="07-SWIPE"   subtitle="Hooks, headlines, popups" chevron onClick={() => {}} />
        <Row leading={<FolderIcon color="var(--indigo)" />} title="08-LIBRARY" subtitle="Reading, prompts, Gemini history" chevron onClick={() => {}} />
        <Row leading={<FolderIcon color="var(--pink)" />}   title="02-MIND"    subtitle="Neuroscience, psychology" chevron onClick={() => {}} />
        <Row leading={<FolderIcon color="var(--gray)" />}   title="All folders"   subtitle="11 sections, 904+ notes" chevron onClick={() => {}} />
      </ListGroup>
    </div>
  );
}

function LaneTile({ to, emoji, label }: { to: string; emoji: string; label: string }) {
  return (
    <Link to={to}>
      <div className="rounded-[12px] py-4 flex flex-col items-center gap-1 active:scale-[0.97] transition-transform"
           style={{ background: 'var(--fill-tertiary)' }}>
        <div className="text-2xl leading-none" style={{ color: 'var(--label)' }}>{emoji}</div>
        <div className="ios-footnote font-semibold" style={{ color: 'var(--label)' }}>{label}</div>
      </div>
    </Link>
  );
}

function TileIcon({ name, color }: { name: any; color: string }) {
  return (
    <div className="w-9 h-9 rounded-[9px] flex items-center justify-center" style={{ background: color, color: 'white' }}>
      <Icon name={name} size={20} />
    </div>
  );
}
function FolderIcon({ color }: { color: string }) {
  return (
    <div className="w-9 h-9 rounded-[9px] flex items-center justify-center" style={{ background: color, color: 'white' }}>
      <Icon name="doc-text" size={18} />
    </div>
  );
}
