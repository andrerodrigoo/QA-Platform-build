import type { ReactNode } from 'react';

/** Small presentational building blocks reused across pages. */

export function Spinner(): JSX.Element {
  return (
    <div className="loading-wrap" role="status" aria-label="Loading">
      <span className="spinner" />
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }): JSX.Element {
  return (
    <div className="error-banner" role="alert">
      {message}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}): JSX.Element {
  return (
    <div className="empty-state">
      <p style={{ fontWeight: 600, margin: 0 }}>{title}</p>
      {hint && <p style={{ margin: '0.25rem 0 0' }}>{hint}</p>}
    </div>
  );
}

const LEVEL_CLASS: Record<string, string> = {
  Low: 'badge-low',
  Medium: 'badge-medium',
  High: 'badge-high',
  Critical: 'badge-critical',
  Pass: 'badge-pass',
  Fail: 'badge-fail',
  Blocked: 'badge-blocked',
};

export function Badge({ value }: { value: string }): JSX.Element {
  const cls = LEVEL_CLASS[value] ?? 'badge-neutral';
  return <span className={`badge ${cls}`}>{value}</span>;
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
