import { useState } from 'react';
import { Modal } from './ui';
import { ApiError } from '../api/client';
import { executionsApi } from '../api/resources';
import { EXECUTION_RESULTS, type ExecutionResult, type TestCase } from '../types';

interface Props {
  testCase: TestCase;
  onClose: () => void;
  /** Called after a successful save; passes the recorded result so the parent
   *  can offer to open a bug form when the result is "Fail". */
  onSaved: (result: ExecutionResult, notes: string) => void;
}

export function ExecutionForm({ testCase, onClose, onSaved }: Props): JSX.Element {
  const [result, setResult] = useState<ExecutionResult | ''>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!result) {
      setError('Result is required');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await executionsApi.create({ testCaseId: testCase.id, result, notes: notes.trim() || null });
      onSaved(result, notes.trim());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to record execution');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Execute: ${testCase.title}`} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}
        <div className="field">
          <label htmlFor="exec-result">Result *</label>
          <select
            id="exec-result"
            value={result}
            onChange={(e) => setResult(e.target.value as ExecutionResult)}
          >
            <option value="">— Select a result —</option>
            {EXECUTION_RESULTS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="exec-notes">Notes</label>
          <textarea
            id="exec-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observations during execution"
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Execution'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
