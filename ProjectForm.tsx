import { useState } from 'react';
import { Modal } from './ui';
import { ApiError } from '../api/client';
import { projectsApi, type ProjectInput } from '../api/resources';
import type { Project } from '../types';

const NAME_MAX = 100;
const DESC_MAX = 500;

interface Props {
  existing?: Project;
  onClose: () => void;
  onSaved: () => void;
}

/** Create/edit form for a project with client-side validation mirroring the API. */
export function ProjectForm({ existing, onClose, onSaved }: Props): JSX.Element {
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function validate(): string | null {
    const trimmed = name.trim();
    if (!trimmed) return 'Project name is required';
    if (trimmed.length > NAME_MAX) return `Project name must be at most ${NAME_MAX} characters`;
    if (description.length > DESC_MAX) return `Description must be at most ${DESC_MAX} characters`;
    return null;
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFieldError(validationError);
      return;
    }
    setFieldError(null);
    setFormError(null);
    setSaving(true);

    const payload: ProjectInput = {
      name: name.trim(),
      description: description.trim() || null,
    };

    try {
      if (existing) {
        await projectsApi.update(existing.id, payload);
      } else {
        await projectsApi.create(payload);
      }
      onSaved();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save project');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={existing ? 'Edit Project' : 'New Project'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="error-banner" role="alert">
            {formError}
          </div>
        )}
        <div className="field">
          <label htmlFor="project-name">Name *</label>
          <input
            id="project-name"
            value={name}
            maxLength={NAME_MAX + 10}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. E-Commerce Platform"
            autoFocus
          />
          {fieldError && <div className="field-error">{fieldError}</div>}
        </div>
        <div className="field">
          <label htmlFor="project-desc">Description</label>
          <textarea
            id="project-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
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
