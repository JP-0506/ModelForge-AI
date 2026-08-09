/* ============================================================
   Button Component
   ============================================================ */

import './Button.css';

const Button = ({
  children,
  variant = 'primary',  // primary | secondary | ghost | danger | outline
  size = 'md',          // sm | md | lg
  fullWidth = false,
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      className={[
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth ? 'btn--full' : '',
        isLoading ? 'btn--loading' : '',
        className,
      ].filter(Boolean).join(' ')}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <span className="btn-spinner" aria-hidden="true" />
      )}
      {!isLoading && leftIcon && (
        <span className="btn-icon btn-icon--left">{leftIcon}</span>
      )}
      <span className="btn-label">{children}</span>
      {!isLoading && rightIcon && (
        <span className="btn-icon btn-icon--right">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
