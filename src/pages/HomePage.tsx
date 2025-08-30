import React, { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import CircularProgress from '../components/CircularProgress';

const HomePage: React.FC = () => {
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking if admin exists
    const checkAdminExists = async () => {
      try {
        // In real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAdminExists(true); // Assume admin exists for demo
      } catch (error) {
        console.error('Error checking admin existence:', error);
        setAdminExists(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminExists();
  }, []);

  const handleLoginSuccess = (result: any) => {
    console.log('Login successful:', result);
    // Handle successful login - redirect to dashboard, etc.
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 text-gray-600">
        <CircularProgress size="large" />
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (adminExists === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Setup Required</h1>
          <p className="text-gray-600">Please set up the admin account first.</p>
        </div>
      </div>
    );
  }

  return (
    <LoginForm 
      onLoginSuccess={handleLoginSuccess}
      title="SIGLAT Admin"
      subtitle="Emergency Response System Administration"
    />
  );
};

export default HomePage;