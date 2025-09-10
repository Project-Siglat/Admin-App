import React from 'react';

const EnvironmentPage: React.FC = () => {
  const environment = import.meta.env.VITE_ENVIRONMENT || import.meta.env.ENVIRONMENT || 'localhost';

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '2rem',
      fontWeight: 'bold'
    }}>
      {environment}
    </div>
  );
};

export default EnvironmentPage;