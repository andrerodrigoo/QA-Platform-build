import { metricsApi } from '../api/resources';
import { useAsync } from '../hooks/useAsync';
import { Spinner, ErrorBanner, EmptyState } from '../components/ui';
import type { DashboardMetrics } from '../types';

export function DashboardPage(): JSX.Element {
  const { data, loading, error } = useAsync<DashboardMetrics>(
    () => metricsApi.dashboard(),
    [],
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!data) return <EmptyState title="No data available" />;

  const { totals, executionBreakdown: ex, bugsBySeverity } = data;
  const hasExecutions = ex.pass + ex.fail + ex.blocked > 0;
  const totalBugs = Object.values(bugsBySeverity).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="grid cols-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card stat">
          <div className="value">{totals.projects}</div>
          <div className="label">Projects</div>
        </div>
        <div className="card stat">
          <div className="value">{totals.testCases}</div>
          <div className="label">Test Cases</div>
        </div>
        <div className="card stat">
          <div className="value">{totals.executions}</div>
          <div className="label">Executions</div>
        </div>
        <div className="card stat">
          <div className="value">{totals.openBugs}</div>
          <div className="label">Open Bugs</div>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Execution Results</h3>
          {!hasExecutions ? (
            <EmptyState
              title="No executions recorded yet"
              hint="Execute a test case to see pass/fail metrics."
            />
          ) : (
            <>
              <div className="bar" aria-label="Execution result distribution">
                <span
                  style={{ width: `${ex.passRate}%`, background: 'var(--color-success)' }}
                  title={`Pass ${ex.passRate}%`}
                />
                <span
                  style={{ width: `${ex.failRate}%`, background: 'var(--color-danger)' }}
                  title={`Fail ${ex.failRate}%`}
                />
                <span
                  style={{ width: `${ex.blockedRate}%`, background: 'var(--color-muted)' }}
                  title={`Blocked ${ex.blockedRate}%`}
                />
              </div>
              <div style={{ marginTop: '1rem', display: 'grid', gap: '0.4rem' }}>
                <MetricRow label="Passed" value={ex.pass} pct={ex.passRate} color="var(--color-success)" />
                <MetricRow label="Failed" value={ex.fail} pct={ex.failRate} color="var(--color-danger)" />
                <MetricRow
                  label="Blocked"
                  value={ex.blocked}
                  pct={ex.blockedRate}
                  color="var(--color-muted)"
                />
              </div>
            </>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Bugs by Severity</h3>
          {totalBugs === 0 ? (
            <EmptyState title="No bugs reported yet" />
          ) : (
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              <MetricRow label="Critical" value={bugsBySeverity.Critical} color="var(--color-danger)" />
              <MetricRow label="High" value={bugsBySeverity.High} color="var(--color-warning)" />
              <MetricRow label="Medium" value={bugsBySeverity.Medium} color="#ca8a04" />
              <MetricRow label="Low" value={bugsBySeverity.Low} color="var(--color-success)" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: number;
  pct?: number;
  color: string;
}): JSX.Element {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span
          style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }}
        />
        {label}
      </span>
      <strong>
        {value}
        {pct !== undefined ? ` (${pct}%)` : ''}
      </strong>
    </div>
  );
}
