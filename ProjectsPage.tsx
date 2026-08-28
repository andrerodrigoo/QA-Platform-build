import { useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api/resources';
import { useAsync } from '../hooks/useAsync';
import { Spinner, ErrorBanner, EmptyState } from '../components/ui';
import { ProjectForm } from '../components/ProjectForm';
import { formatPassRate } from '../utils/format';
import type { ProjectSummary } from '../types';

export function ProjectsPage(): JSX.Element {
  const { data, loading, error, reload } = useAsync<ProjectSummary[]>(
    () => projectsApi.list(),
    [],
  );
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="page-header">
        <h1>Projects</h1>
        <button onClick={() => setShowForm(true)}>+ New Project</button>
      </div>

      {loading && <Spinner />}
      {error && <ErrorBanner message={error} />}

      {!loading && !error && data && data.length === 0 && (
        <EmptyState
          title="No projects yet"
          hint="Create your first project to start organizing test cases."
        />
      )}

      {!loading && !error && data && data.length > 0 && (
        <div className="grid cols-2">
          {data.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="card"
              style={{ color: 'inherit' }}
            >
              <h3 style={{ margin: '0 0 0.35rem' }}>{project.name}</h3>
              <p className="muted" style={{ margin: '0 0 0.75rem' }}>
                {project.description || 'No description'}
              </p>
              <div className="row-meta">
                <span className="badge badge-neutral">{project.testCaseCount} test cases</span>
                <span className="badge badge-neutral">{project.openBugCount} open bugs</span>
                <span className="badge badge-neutral">
                  Pass rate: {formatPassRate(project.passRate)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showForm && (
        <ProjectForm
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            reload();
          }}
        />
      )}
    </div>
  );
}
