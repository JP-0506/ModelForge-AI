/* ============================================================
   Input Component — Floating label, glass style
   ============================================================ */

import { forwardRef, useState } from 'react';
import './Input.css';

const Input = forwardRef(({
  label,
  type = 'text',
  error = '',
  hint = '',
  leftIcon = null,
  rightIcon = null,
  onRightIconClick = null,
  className = '',
  id,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`input-wrapper ${error ? 'input-wrapper--error' : ''} ${className}`}>
      <div className={`input-field ${isFocused ? 'input-field--focused' : ''} ${error ? 'input-field--error' : ''}`}>
        {leftIcon && (
          <span className="input-icon input-icon--left">{leftIcon}</span>
        )}
        <div className="input-container">
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`input ${leftIcon ? 'input--has-left-icon' : ''} ${rightIcon ? 'input--has-right-icon' : ''}`}
            placeholder=" "
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {label && (
            <label htmlFor={inputId} className="input-label">
              {label}
            </label>
          )}
        </div>
        {rightIcon && (
          <button
            type="button"
            className={`input-icon input-icon--right ${onRightIconClick ? 'input-icon--clickable' : ''}`}
            onClick={onRightIconClick}
            tabIndex={onRightIconClick ? 0 : -1}
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && <p className="input-error">{error}</p>}
      {!error && hint && <p className="input-hint">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
