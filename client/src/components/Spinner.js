import React from 'react';

const Spinner = ({ label = '', size = 'small' }) => (
  <div className={`loader loader--${size}`} role="status" aria-live="polite">
    <span className="loader__ring" aria-hidden="true" />
    {label && <span>{label}</span>}
  </div>
);

export default Spinner;
