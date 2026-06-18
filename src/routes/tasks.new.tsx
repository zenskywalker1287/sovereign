import { useState } from 'react';
import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router';
import { LargeTitle, Card, Button, ListGroup, Row } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { useStore } from '@/domain/store';
import { DEFAULT_ARCHETYPES, type ArchetypeSlug } from '@/domain/archetypes';
import type { TaskScope } from '@/domain/tasks';

export const Route = createFileRoute('/tasks/new')({
  component: AddTask,
  validateSearch: (s: Record<string, unknown>) => ({
    scope: (s.scope === 'weekly' || s.scope === 'monthly' ? s.scope : 'daily') as TaskScope,
  }),
});

function AddTask() {
  const search = useSearch({ from: '/tasks/new' });
  const navigate = useNavigate();
  const addCustomTask = useStore(s => s.addCustomTask);

  const [title, setTitle] = useState('');
  const [scope, setScope] = useState<TaskScope>(search.scope);
  const [xp, setXp] = useState(25);
  const [archetype, setArchetype] = useState<ArchetypeSlug>('executor');

  const canSave = title.trim().length > 0;

  function save() {
    if (!canSave) return;
    addCustomTask({ title, scope, xp, archetype });
    navigate({ to: '/' });
  }

  return (
    <div>
      <header className="safe-top px-4 pt-3 pb-2 flex items-center justify-between">
        <Link to="/" className="ios-body" style={{ color: 'var(--tint)' }}>Cancel</Link>
        <div className="ios-headline" style={{ color: 'var(--label)' }}>New task</div>
        <button
          onClick={save}
          disabled={!canSave}
          className="ios-body ios-headline font-semibold"
          style={{ color: canSave ? 'var(--tint)' : 'var(--label-tertiary)' }}
        >
          Save
        </button>
      </header>

      <LargeTitle title="New task" />

      {/* Title input */}
      <section className="px-4 mb-6">
        <div className="px-4 mb-1.5 ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>
          What needs doing?
        </div>
        <Card>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Send 5 cold emails"
            autoFocus
            autoCorrect="off"
            autoCapitalize="sentences"
            className="w-full bg-transparent outline-none ios-body"
            style={{ color: 'var(--label)' }}
          />
        </Card>
      </section>

      {/* Scope picker */}
      <ListGroup header="When does it reset?">
        <Row
          leading={<Dot color={scope === 'daily' ? 'var(--tint)' : 'transparent'} />}
          title="Daily"
          subtitle="Re-appears every morning"
          onClick={() => setScope('daily')}
        />
        <Row
          leading={<Dot color={scope === 'weekly' ? 'var(--tint)' : 'transparent'} />}
          title="Weekly"
          subtitle="Resets Monday"
          onClick={() => setScope('weekly')}
        />
        <Row
          leading={<Dot color={scope === 'monthly' ? 'var(--tint)' : 'transparent'} />}
          title="Monthly"
          subtitle="Resets on the 1st"
          onClick={() => setScope('monthly')}
        />
      </ListGroup>

      {/* XP picker */}
      <section className="px-4 mb-6">
        <div className="px-4 mb-1.5 ios-footnote uppercase tracking-wide" style={{ color: 'var(--label-secondary)' }}>
          XP value
        </div>
        <Card>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={xp}
              onChange={e => setXp(Number(e.target.value))}
              className="flex-1 accent-current"
              style={{ accentColor: 'var(--tint)' }}
            />
            <div className="ios-headline font-mono w-16 text-right" style={{ color: 'var(--label)' }}>+{xp}</div>
          </div>
          <div className="ios-footnote mt-2" style={{ color: 'var(--label-secondary)' }}>
            Earned when you check the task off
          </div>
        </Card>
      </section>

      {/* Archetype */}
      <ListGroup header="Feeds which archetype?" footer="XP flows into this archetype's level when you complete the task.">
        {DEFAULT_ARCHETYPES.map(a => (
          <Row
            key={a.slug}
            leading={<Dot color={archetype === a.slug ? 'var(--tint)' : 'transparent'} />}
            title={a.name}
            subtitle={a.oneLiner}
            onClick={() => setArchetype(a.slug)}
          />
        ))}
      </ListGroup>

      {/* Bottom save button (in addition to top-right) */}
      <section className="px-4 pb-12">
        <Button variant="filled" size="lg" fullWidth onClick={save}>
          {canSave ? `Add ${scope === 'daily' ? 'daily' : scope === 'weekly' ? 'weekly' : 'monthly'} task` : 'Type a title to save'}
        </Button>
      </section>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <div
      className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
      style={{ borderColor: color === 'transparent' ? 'var(--label-quaternary)' : color }}
    >
      {color !== 'transparent' && <div className="w-2 h-2 rounded-full" style={{ background: color }} />}
    </div>
  );
}
