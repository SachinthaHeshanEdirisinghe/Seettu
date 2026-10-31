import { CircleAlert, CircleCheck, X } from 'lucide-react';

function Toaster({ toasts, onDismiss }) {
  return (
    <div className="toaster" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.type}`}
          role={t.type === 'error' ? 'alert' : 'status'}
        >
          {t.type === 'error' ? (
            <CircleAlert size={18} aria-hidden />
          ) : (
            <CircleCheck size={18} aria-hidden />
          )}
          <span className="toast__msg">{t.message}</span>
          <button
            type="button"
            className="toast__close"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss message"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toaster;
