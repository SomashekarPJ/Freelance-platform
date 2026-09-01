import React from 'react';

const Spinner = () => (
  <>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    <div style={{ width: 20, height: 20, border: '3px solid #e9ecef', borderTop: '3px solid #0a58ca', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
  </>
);

export default Spinner;
