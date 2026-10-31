import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/** Labelled input with an optional leading icon and password reveal. */
function Field({ id, label, icon: Icon, type = 'text', hint, ...inputProps }) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={`field__control ${Icon ? 'field__control--icon' : ''}`}>
        {Icon && <Icon className="field__icon" size={18} aria-hidden />}
        <input id={id} type={isPassword && revealed ? 'text' : type} {...inputProps} />
        {isPassword && (
          <button
            type="button"
            className="field__reveal"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
          >
            {revealed ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
          </button>
        )}
      </div>
      {hint && <p className="field__hint">{hint}</p>}
    </div>
  );
}

export default Field;
