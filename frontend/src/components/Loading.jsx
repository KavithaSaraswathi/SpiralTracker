import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
      <div
        style={{
          width: '28px',
          height: '28px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          margin: '0 auto 12px auto',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ fontSize: '0.9rem' }}>{message}</p>
    </div>
  );
};

export default Loading;
