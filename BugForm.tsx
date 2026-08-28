import { useState } from 'react';
import { Modal } from './ui';
import { ApiError } from '../api/client';
import { bugsApi, type BugInput } from '../api/resources';
import {
  SEVERITIES,
  PRIORITIES,
  BUG_STATUSES,
  type Bug,
  type Severity,
  type Priority,
  type BugStatus,
} from '../types';

const TITLE_MAX = 200;

interface Props {
  projectId: number;
  existing?: Bug;
  /** Pre-fill values when creating a bug from a failed execution. */
  prefill?: Partial<BugInput>;
  onClose: () => void;
  onSaved: () => void;
}

export function BugForm({ projectId, existing, prefill, onClose, onSaved }: Props): JSX.Element {
  const [title, setTitle] = useState(existing?.title ?? prefill?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [stepsToReproduce, setSteps] = useState(
    existing?.stepsToReproduce ?? prefill?.stepsToReproduce ?? '',
  );
  const [expectedResult, setExpected] = useState(existing?.expectedResult ?? '');
  const [actualResult, setActual] = useState(
    existing?.actualResult ?? prefill?.actualResult ?? '',
  );
  const [severity, setSeverity] = useState<Severity>(existing?.severity ?? 'Medium');
  const [priority, setPriority] = useState<Priority>(existing?.priority ?? 'Medium');
  const [status, setStatus] = useState<BugStatus>(existing?.status ?? 'Open');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const testCaseId = existing?.testCaseId ?? prefill?.testCaseId ?? null;

  function validate(): string | null {
    if (!title.trim()) return 'Bug title is required';
    if (title.trim().length > TITLE_MAX)
      return `Bug title must be at most ${TITLE_MAX} characters`;
    return null;
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSaving(true);

    const payload: BugInput = {
      projectId,
      testCaseId,
      title: title.trim(),
      description: description.trim() || null,
      stepsToReproduce: stepsToReproduce.trim() || null,
      expectedResult: expectedResult.trim() || null,
      actualResult: actualResult.trim() || null,
      severity,
      priority,
      status,
    };

    try {
      if (existing) {
        const { projectId: _pid, ...updatePayload } = payload;
        await bugsApi.update(existing.id, updatePayload);
      } else {
        await bugsApi.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save bug');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={existing ? 'Edit Bug' : 'New Bug'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}
        <div className="field">
          <label htmlFor="bug-title">Title *</label>
          <input
            id="bug-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Login button unresponsive on mobile"
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="bug-steps">Steps to Reproduce</label>
          <textarea
            id="bug-steps"
            value={stepsToReproduce}
            onChange={(e) => setSteps(e.target.value)}
          />
        </div>
        <div className="grid cols-2">
          <div className="field">
            <label htmlFor="bug-expected">Expected Result</label>
            <textarea
              id="bug-expected"
              value={expectedResult}
              onChange={(e) => setExpected(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="bug-actual">Actual Result</label>
            <textarea
              id="bug-actual"
              value={actualResult}
              onChange={(e) => setActual(e.target.value)}
            />
          </div>
        </div>
        <div className="grid cols-3">
          <div className="field">
            <label htmlFor="bug-severity">Severity</label>
            <select
              id="bug-severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="bug-priority">Priority</label>
            <select
              id="bug-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="bug-status">Status</label>
            <select
              id="bug-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BugStatus)}
            >
              {BUG_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
