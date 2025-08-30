import React from 'react';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  const handleLoginSuccess = (result: any) => {
    console.log('Login successful:', result);
    // Redirect to admin dashboard
    window.location.href = '/dashboard';
  };

  return (
    <LoginForm 
      onLoginSuccess={handleLoginSuccess}
      title="SIGLAT Admin"
      subtitle="Emergency Response System Administration"
    />
  );
};

export default LoginPage;