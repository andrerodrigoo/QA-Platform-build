import { useMemo, useState } from 'react';
import { bugsApi, projectsApi } from '../api/resources';
import { useAsync } from '../hooks/useAsync';
import { Spinner, ErrorBanner, EmptyState, Badge } from '../components/ui';
import { BugForm } from '../components/BugForm';
import { SEVERITIES, BUG_STATUSES, type Bug, type ProjectSummary } from '../types';

export function BugsPage(): JSX.Element {
  const projects = useAsync<ProjectSummary[]>(() => projectsApi.list(), []);
  const bugs = useAsync<Bug[]>(() => bugsApi.list(), []);

  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingBug, setEditingBug] = useState<Bug | null>(null);
  const [creatingForProject, setCreatingForProject] = useState<number | ''>('');

  const projectName = useMemo(() => {
    const map = new Map<number, string>();
    (projects.data ?? []).forEach((p) => map.set(p.id, p.name));
    return map;
  }, [projects.data]);

  const visibleBugs = (bugs.data ?? []).filter((bug) => {
    if (severityFilter && bug.severity !== severityFilter) return false;
    if (statusFilter && bug.status !== statusFilter) return false;
    return true;
  });

  const canCreate = (projects.data ?? []).length > 0;

  return (
    <div>
      <div className="page-header">
        <h1>Bugs</h1>
        {canCreate && (
          <button onClick={() => setCreatingForProject((projects.data ?? [])[0].id)}>
            + New Bug
          </button>
        )}
      </div>

      <div className="toolbar">
        <div className="field">
          <label htmlFor="b-severity">Severity</label>
          <select
            id="b-severity"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="">All</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="b-status">Status</label>
          <select
            id="b-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            {BUG_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(bugs.loading || projects.loading) && <Spinner />}
      {bugs.error && <ErrorBanner message={bugs.error} />}

      {!bugs.loading && !bugs.error && (
        <div className="card">
          {visibleBugs.length === 0 ? (
            <EmptyState
              title="No bugs found"
              hint={
                (bugs.data ?? []).length === 0
                  ? 'Report a bug or create one from a failed test execution.'
                  : 'Try adjusting your filters.'
              }
            />
          ) : (
            visibleBugs.map((bug) => (
              <div key={bug.id} className="list-row">
                <div>
                  <strong>{bug.title}</strong>
                  <div className="row-meta">
                    <Badge value={bug.severity} />
                    <span className="badge badge-neutral">Priority: {bug.priority}</span>
                    <span className="badge badge-neutral">{bug.status}</span>
                    <span className="muted">{projectName.get(bug.projectId) ?? '—'}</span>
                  </div>
                </div>
                <button className="secondary" onClick={() => setEditingBug(bug)}>
                  Edit
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {creatingForProject !== '' && (
        <BugForm
          projectId={creatingForProject}
          onClose={() => setCreatingForProject('')}
          onSaved={() => {
            setCreatingForProject('');
            bugs.reload();
          }}
        />
      )}
      {editingBug && (
        <BugForm
          projectId={editingBug.projectId}
          existing={editingBug}
          onClose={() => setEditingBug(null)}
          onSaved={() => {
            setEditingBug(null);
            bugs.reload();
          }}
        />
      )}
    </div>
  );
}
