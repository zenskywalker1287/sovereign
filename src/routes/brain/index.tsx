import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { LargeTitle, ListGroup, Row, Card } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { listGraded } from '@/features/writing-studio/history';

export const Route = createFileRoute('/brain/')({ component: Brain });

function Brain() {
  const { data } = useQuery({ queryKey: ['graded'], queryFn: listGraded });
  const recent = (data ?? []).slice(0, 3);

  return (
    <div>
      <LargeTitle title="Brain" subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>Writing Studio + the vault</span>} />

      <section className="px-4 mb-4">
        <Card>
          <div className="ios-footnote uppercase tracking-wide mb-1" style={{ color: 'var(--label-secondary)' }}>Writing Studio</div>
          <div className="ios-title-2 mb-3" style={{ color: 'var(--label)' }}>Pick a drill. Write. Get graded.</div>
          <div className="grid grid-cols-3 gap-2">
            <LaneTile lane="fiction"  emoji="✦" label="Fiction" />
            <LaneTile lane="copy"     emoji="◆" label="Copy"    />
            <LaneTile lane="freeform" emoji="●" label="Freeform"/>
          </div>
        </Card>
      </section>

      <section className="px-4 mb-6">
        <Link to="/speech">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                   style={{ background: 'var(--orange)', color: 'white' }}>
                <Icon name="sparkles" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>Speech Gym</div>
                <div className="ios-headline" style={{ color: 'var(--label)' }}>Train articulate speech</div>
                <div className="ios-footnote mt-0.5" style={{ color: 'var(--label-secondary)' }}>
                  Articulation · pace · vocabulary · cadence · 3×5 daily diet
                </div>
              </div>
              <Icon name="chevron-right" size={16} />
            </div>
          </Card>
        </Link>
      </section>

      <ListGroup header="Author Bootcamps">
        <Link to="/note/$" params={{ _splat: '01-CRAFT/writing/authors/stephenie-meyer.md' }}>
          <Row leading={<TileIcon name="book"  color="var(--purple)" />} title="Stephenie Meyer" subtitle="Fiction · interiority + restraint" chevron />
        </Link>
        <Link to="/note/$" params={{ _splat: '01-CRAFT/writing/authors/gary-halbert.md' }}>
          <Row leading={<TileIcon name="flame" color="var(--red)" />}    title="Gary Halbert"    subtitle="Copy · headlines + grabbers"      chevron />
        </Link>
      </ListGroup>

      <ListGroup header="Capture">
        <Link to="/watch"><Row
          leading={<TileIcon name="sparkles" color="var(--teal)" />}
          title="Transcribe a URL"
          subtitle="YouTube · IG reel · X video · TikTok"
          chevron
        /></Link>
      </ListGroup>

      <ListGroup header={`Recent Grades · ${(data ?? []).length}`}>
        {recent.length === 0 && (
          <Row title="No grades yet" subtitle="Submit a drill to populate" />
        )}
        {recent.map(e => (
          <Link key={e.path} to="/note/$" params={{ _splat: e.path }}>
            <Row
              title={`${e.date} · ${e.drill}`}
              subtitle={e.lane}
              trailing={`${e.total}/${e.max}`}
              chevron
            />
          </Link>
        ))}
        <Link to="/brain/history"><Row
          leading={<TileIcon name="doc-text" color="var(--tint)" />}
          title="See all"
          subtitle="Average + sparkline + every grade"
          chevron
        /></Link>
      </ListGroup>

      <ListGroup header="Vault folders">
        <FolderRow path="01-CRAFT"   subtitle="Writing, copy, scripts"           color="var(--orange)" />
        <FolderRow path="07-SWIPE"   subtitle="Hooks, headlines, popups"         color="var(--green)" />
        <FolderRow path="08-LIBRARY" subtitle="Reading, prompts, transcripts"    color="var(--indigo)" />
        <FolderRow path="02-MIND"    subtitle="Neuroscience, psychology"         color="var(--pink)" />
        <FolderRow path="00-INBOX"   subtitle="Daily notes, mental diet, journal" color="var(--blue)" />
        <FolderRow path="03-OPS"     subtitle="Active projects, agency ops"      color="var(--gray)" />
      </ListGroup>
    </div>
  );
}

function LaneTile({ lane, emoji, label }: { lane: 'fiction' | 'copy' | 'freeform'; emoji: string; label: string }) {
  return (
    <Link to="/brain/studio/$lane" params={{ lane }}>
      <div className="rounded-[12px] py-4 flex flex-col items-center gap-1 active:scale-[0.97] transition-transform"
           style={{ background: 'var(--fill-tertiary)' }}>
        <div className="text-2xl leading-none" style={{ color: 'var(--label)' }}>{emoji}</div>
        <div className="ios-footnote font-semibold" style={{ color: 'var(--label)' }}>{label}</div>
      </div>
    </Link>
  );
}

function FolderRow({ path, subtitle, color }: { path: string; subtitle: string; color: string }) {
  return (
    <Link to="/folder/$" params={{ _splat: path }}>
      <Row
        leading={
          <div className="w-9 h-9 rounded-[9px] flex items-center justify-center" style={{ background: color, color: 'white' }}>
            <Icon name="doc-text" size={18} />
          </div>
        }
        title={path}
        subtitle={subtitle}
        chevron
      />
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
