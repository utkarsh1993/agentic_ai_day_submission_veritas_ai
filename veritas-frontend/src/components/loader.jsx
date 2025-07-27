import React from 'react';

const loaderStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const spinnerStyles = {
  border: '8px solid #f3f3f3',
  borderTop: '8px solid #00008b', // Dark blue
  borderRadius: '50%',
  width: '60px',
  height: '60px',
  animation: 'spin 2s linear infinite'
};

const Loader = () => (
  <div style={loaderStyles}>
    <div style={spinnerStyles}></div>
  </div>
);

export default Loader;

