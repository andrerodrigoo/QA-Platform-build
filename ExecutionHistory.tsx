import { executionsApi } from '../api/resources';
import { useAsync } from '../hooks/useAsync';
import { Modal, Spinner, ErrorBanner, EmptyState, Badge } from './ui';
import { formatDateTime } from '../utils/format';
import type { Execution, TestCase } from '../types';

interface Props {
  testCase: TestCase;
  onClose: () => void;
}

/** Shows the execution history for a test case, latest first (FR-023). */
export function ExecutionHistory({ testCase, onClose }: Props): JSX.Element {
  const { data, loading, error } = useAsync<Execution[]>(
    () => executionsApi.listForTestCase(testCase.id),
    [testCase.id],
  );

  return (
    <Modal title={`History: ${testCase.title}`} onClose={onClose}>
      {loading && <Spinner />}
      {error && <ErrorBanner message={error} />}
      {!loading && !error && data && data.length === 0 && (
        <EmptyState title="No executions yet" hint="This test case has not been executed." />
      )}
      {!loading && !error && data && data.length > 0 && (
        <div>
          {data.map((execution) => (
            <div key={execution.id} className="list-row">
              <div>
                <Badge value={execution.result} />
                {execution.notes && (
                  <p className="muted" style={{ margin: '0.35rem 0 0' }}>
                    {execution.notes}
                  </p>
                )}
              </div>
              <span className="muted">{formatDateTime(execution.executedAt)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="modal-actions">
        <button className="secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
