import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectsApi, testCasesApi } from '../api/resources';
import { ApiError } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { Spinner, ErrorBanner, EmptyState, Badge } from '../components/ui';
import { ProjectForm } from '../components/ProjectForm';
import { TestCaseForm } from '../components/TestCaseForm';
import { ExecutionForm } from '../components/ExecutionForm';
import { BugForm } from '../components/BugForm';
import { ExecutionHistory } from '../components/ExecutionHistory';
import { filterTestCases, type TestCaseFilters } from '../utils/format';
import {
  PRIORITIES,
  TEST_TYPES,
  TEST_CASE_STATUSES,
  type ProjectSummary,
  type TestCase,
  type ExecutionResult,
} from '../types';
import type { BugInput } from '../api/resources';

export function ProjectDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const navigate = useNavigate();

  const project = useAsync<ProjectSummary>(() => projectsApi.get(projectId), [projectId]);
  const testCases = useAsync<TestCase[]>(() => testCasesApi.list(projectId), [projectId]);

  const [filters, setFilters] = useState<TestCaseFilters>({
    search: '',
    status: '',
    priority: '',
    type: '',
  });
  const [showProjectEdit, setShowProjectEdit] = useState(false);
  const [showTestCaseForm, setShowTestCaseForm] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [executingTestCase, setExecutingTestCase] = useState<TestCase | null>(null);
  const [historyTestCase, setHistoryTestCase] = useState<TestCase | null>(null);
  const [bugPrefill, setBugPrefill] = useState<Partial<BugInput> | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function reloadAll(): void {
    project.reload();
    testCases.reload();
  }

  async function handleDeleteProject(): Promise<void> {
    if (!window.confirm('Delete this project and ALL its test cases, executions and bugs?')) {
      return;
    }
    // Fix for BUG-005: handle delete failures instead of navigating away blindly.
    try {
      await projectsApi.remove(projectId);
      navigate('/projects');
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to delete project');
    }
  }

  async function handleDeleteTestCase(tc: TestCase): Promise<void> {
    if (!window.confirm(`Delete test case "${tc.title}"?`)) return;
    // Fix for BUG-005: surface errors; Fix for BUG-003: refresh list AND stats.
    try {
      await testCasesApi.remove(tc.id);
      reloadAll();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to delete test case');
    }
  }

  function handleExecutionSaved(result: ExecutionResult, notes: string, tc: TestCase): void {
    setExecutingTestCase(null);
    reloadAll();
    if (result === 'Fail') {
      // AC US-013: prompt to create a bug when a test fails.
      if (window.confirm('Test failed. Create a bug report for it?')) {
        setBugPrefill({
          testCaseId: tc.id,
          title: `[Failed] ${tc.title}`,
          stepsToReproduce: tc.steps,
          expectedResult: tc.expectedResult,
          actualResult: notes || undefined,
        });
      }
    }
  }

  if (project.loading || testCases.loading) return <Spinner />;
  if (project.error) return <ErrorBanner message={project.error} />;
  if (!project.data) return <EmptyState title="Project not found" />;

  const visibleCases = filterTestCases(testCases.data ?? [], filters);

  return (
    <div>
      <p style={{ margin: '0 0 0.5rem' }}>
        <Link to="/projects">← Projects</Link>
      </p>
      {actionError && <ErrorBanner message={actionError} />}
      <div className="page-header">
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>{project.data.name}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {project.data.description || 'No description'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="secondary" onClick={() => setShowProjectEdit(true)}>
            Edit
          </button>
          <button className="danger" onClick={handleDeleteProject}>
            Delete
          </button>
        </div>
      </div>

      <div className="grid cols-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card stat">
          <div className="value">{project.data.testCaseCount}</div>
          <div className="label">Test Cases</div>
        </div>
        <div className="card stat">
          <div className="value">{project.data.openBugCount}</div>
          <div className="label">Open Bugs</div>
        </div>
        <div className="card stat">
          <div className="value">
            {project.data.passRate === null ? 'N/A' : `${project.data.passRate}%`}
          </div>
          <div className="label">Pass Rate</div>
        </div>
      </div>

      <div className="page-header">
        <h2 style={{ margin: 0 }}>Test Cases</h2>
        <button onClick={() => setShowTestCaseForm(true)}>+ New Test Case</button>
      </div>

      <div className="toolbar">
        <div className="field" style={{ flex: '2 1 200px' }}>
          <label htmlFor="tc-search">Search</label>
          <input
            id="tc-search"
            placeholder="Search by title…"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="f-status">Status</label>
          <select
            id="f-status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All</option>
            {TEST_CASE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-priority">Priority</label>
          <select
            id="f-priority"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-type">Type</label>
          <select
            id="f-type"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All</option>
            {TEST_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {testCases.error && <ErrorBanner message={testCases.error} />}

      <div className="card">
        {visibleCases.length === 0 ? (
          <EmptyState
            title="No test cases found"
            hint={
              (testCases.data ?? []).length === 0
                ? 'Create your first test case for this project.'
                : 'Try adjusting your search or filters.'
            }
          />
        ) : (
          visibleCases.map((tc) => (
            <div key={tc.id} className="list-row">
              <div>
                <strong>{tc.title}</strong>
                <div className="row-meta">
                  <Badge value={tc.priority} />
                  <span className="badge badge-neutral">{tc.type}</span>
                  <span className="badge badge-neutral">{tc.status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button className="secondary" onClick={() => setExecutingTestCase(tc)}>
                  Execute
                </button>
                <button className="secondary" onClick={() => setHistoryTestCase(tc)}>
                  History
                </button>
                <button className="secondary" onClick={() => setEditingTestCase(tc)}>
                  Edit
                </button>
                <button className="danger" onClick={() => handleDeleteTestCase(tc)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showProjectEdit && (
        <ProjectForm
          existing={project.data}
          onClose={() => setShowProjectEdit(false)}
          onSaved={() => {
            setShowProjectEdit(false);
            project.reload();
          }}
        />
      )}
      {showTestCaseForm && (
        <TestCaseForm
          projectId={projectId}
          onClose={() => setShowTestCaseForm(false)}
          onSaved={() => {
            setShowTestCaseForm(false);
            reloadAll();
          }}
        />
      )}
      {editingTestCase && (
        <TestCaseForm
          projectId={projectId}
          existing={editingTestCase}
          onClose={() => setEditingTestCase(null)}
          onSaved={() => {
            setEditingTestCase(null);
            reloadAll();
          }}
        />
      )}
      {executingTestCase && (
        <ExecutionForm
          testCase={executingTestCase}
          onClose={() => setExecutingTestCase(null)}
          onSaved={(result, notes) =>
            handleExecutionSaved(result, notes, executingTestCase)
          }
        />
      )}
      {historyTestCase && (
        <ExecutionHistory
          testCase={historyTestCase}
          onClose={() => setHistoryTestCase(null)}
        />
      )}
      {bugPrefill && (
        <BugForm
          projectId={projectId}
          prefill={bugPrefill}
          onClose={() => setBugPrefill(null)}
          onSaved={() => {
            setBugPrefill(null);
            reloadAll();
          }}
        />
      )}
    </div>
  );
}
