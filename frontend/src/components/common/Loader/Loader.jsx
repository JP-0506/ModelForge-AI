/* ============================================================
   Loader / Spinner Component
   ============================================================ */

import './Loader.css';

const Loader = ({
  size = 'md',       // sm | md | lg
  fullscreen = false,
  overlay = false,
  text = '',
  color = 'primary', // primary | white
}) => {
  if (fullscreen) {
    return (
      <div className="loader-fullscreen">
        <div className="loader-content">
          <div className={`loader-spinner loader-spinner--${size} loader-spinner--${color}`} />
          {text && <p className="loader-text">{text}</p>}
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="loader-overlay">
        <div className="loader-content">
          <div className={`loader-spinner loader-spinner--${size} loader-spinner--${color}`} />
          {text && <p className="loader-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loader-inline">
      <div className={`loader-spinner loader-spinner--${size} loader-spinner--${color}`} />
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;
