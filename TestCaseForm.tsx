import { useState } from 'react';
import { Modal } from './ui';
import { ApiError } from '../api/client';
import { testCasesApi, type TestCaseInput } from '../api/resources';
import {
  PRIORITIES,
  TEST_TYPES,
  TEST_CASE_STATUSES,
  type TestCase,
  type Priority,
  type TestType,
  type TestCaseStatus,
} from '../types';

const TITLE_MAX = 200;

interface Props {
  projectId: number;
  existing?: TestCase;
  onClose: () => void;
  onSaved: () => void;
}

export function TestCaseForm({ projectId, existing, onClose, onSaved }: Props): JSX.Element {
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [preconditions, setPreconditions] = useState(existing?.preconditions ?? '');
  const [steps, setSteps] = useState(existing?.steps ?? '');
  const [expectedResult, setExpectedResult] = useState(existing?.expectedResult ?? '');
  const [priority, setPriority] = useState<Priority>(existing?.priority ?? 'Medium');
  const [type, setType] = useState<TestType>(existing?.type ?? 'Functional');
  const [status, setStatus] = useState<TestCaseStatus>(existing?.status ?? 'Active');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function validate(): string | null {
    if (!title.trim()) return 'Title is required';
    if (title.trim().length > TITLE_MAX) return `Title must be at most ${TITLE_MAX} characters`;
    if (!steps.trim()) return 'Steps are required';
    if (!expectedResult.trim()) return 'Expected result is required';
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

    const payload: TestCaseInput = {
      projectId,
      title: title.trim(),
      description: description.trim() || null,
      preconditions: preconditions.trim() || null,
      steps: steps.trim(),
      expectedResult: expectedResult.trim(),
      priority,
      type,
      status,
    };

    try {
      if (existing) {
        const { projectId: _pid, ...updatePayload } = payload;
        await testCasesApi.update(existing.id, updatePayload);
      } else {
        await testCasesApi.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save test case');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={existing ? 'Edit Test Case' : 'New Test Case'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}
        <div className="field">
          <label htmlFor="tc-title">Title *</label>
          <input
            id="tc-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Verify successful login"
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="tc-pre">Preconditions</label>
          <textarea
            id="tc-pre"
            value={preconditions}
            onChange={(e) => setPreconditions(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="tc-steps">Steps *</label>
          <textarea id="tc-steps" value={steps} onChange={(e) => setSteps(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="tc-expected">Expected Result *</label>
          <textarea
            id="tc-expected"
            value={expectedResult}
            onChange={(e) => setExpectedResult(e.target.value)}
          />
        </div>
        <div className="grid cols-3">
          <div className="field">
            <label htmlFor="tc-priority">Priority</label>
            <select
              id="tc-priority"
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
            <label htmlFor="tc-type">Type</label>
            <select id="tc-type" value={type} onChange={(e) => setType(e.target.value as TestType)}>
              {TEST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="tc-status">Status</label>
            <select
              id="tc-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TestCaseStatus)}
            >
              {TEST_CASE_STATUSES.map((s) => (
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
