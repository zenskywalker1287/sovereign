import { createFileRoute, Link } from '@tanstack/react-router';
import { LargeTitle, ListGroup, Row, Button } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { useStore } from '@/domain/store';
import { SCOPE_LABEL, type TaskScope } from '@/domain/tasks';

export const Route = createFileRoute('/tasks/')({ component: Tasks });

function Tasks() {
  const tasks = useStore(s => s.customTasks);
  const removeCustomTask = useStore(s => s.removeCustomTask);

  function confirmDelete(id: string, title: string) {
    if (confirm(`Delete "${title}"?\n\nThis removes the task and all its completion history.`)) {
      removeCustomTask(id);
    }
  }

  const byScope: Record<TaskScope, typeof tasks> = {
    daily:   tasks.filter(t => t.scope === 'daily'),
    weekly:  tasks.filter(t => t.scope === 'weekly'),
    monthly: tasks.filter(t => t.scope === 'monthly'),
  };

  return (
    <div>
      <header className="safe-top px-4 pt-3 pb-2 flex items-center justify-between">
        <Link to="/" className="ios-body" style={{ color: 'var(--tint)' }}>
          <Icon name="chevron-left" size={16} /> Today
        </Link>
        <div className="ios-headline" style={{ color: 'var(--label)' }}>Manage</div>
        <Link to="/tasks/new" search={{ scope: "daily" as const }} className="ios-body" style={{ color: 'var(--tint)' }}>
          <Icon name="plus" size={18} />
        </Link>
      </header>

      <LargeTitle title="Your tasks" subtitle={<span className="ios-subheadline" style={{ color: 'var(--label-secondary)' }}>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>} />

      {tasks.length === 0 ? (
        <section className="px-4 py-8 text-center">
          <div className="ios-headline" style={{ color: 'var(--label)' }}>No custom tasks yet</div>
          <div className="ios-footnote mt-1 mb-4" style={{ color: 'var(--label-secondary)' }}>
            Add a daily, weekly, or monthly task and it shows up on Today.
          </div>
          <Link to="/tasks/new" search={{ scope: "daily" as const }}>
            <Button variant="filled">Add your first task</Button>
          </Link>
        </section>
      ) : (
        (['daily', 'weekly', 'monthly'] as TaskScope[]).map(scope => (
          byScope[scope].length === 0 ? null : (
            <ListGroup key={scope} header={SCOPE_LABEL[scope]}>
              {byScope[scope].map(t => (
                <Row
                  key={t.id}
                  title={t.title}
                  subtitle={`+${t.xp} XP · ${t.archetype}`}
                  trailing={
                    <button
                      onClick={() => confirmDelete(t.id, t.title)}
                      className="ios-footnote font-semibold active:opacity-60"
                      style={{ color: 'var(--red)' }}
                    >
                      Delete
                    </button>
                  }
                />
              ))}
            </ListGroup>
          )
        ))
      )}

      {tasks.length > 0 && (
        <section className="px-4 pb-12">
          <Link to="/tasks/new" search={{ scope: "daily" as const }}>
            <Button variant="tinted" fullWidth leading={<Icon name="plus" size={16} />}>
              Add another
            </Button>
          </Link>
        </section>
      )}
    </div>
  );
}
