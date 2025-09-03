import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminExists } from '../lib/api.js';
import LoginForm from '../components/LoginForm.js';
import Card from '../components/Card.js';
import Button from '../components/Button.js';
import LoadingScreen from '../components/LoadingScreen.tsx';

const LoginPage: React.FC = () => {
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminExistence();
  }, []);

  const checkAdminExistence = async () => {
    try {
      const result = await checkAdminExists();
      setAdminExists(result.exists);
    } catch (error) {
      console.error('Error checking admin existence:', error);
      setAdminExists(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (result: any) => {
    console.log('Login successful:', result);
    // Navigation is now handled within LoginForm component
  };

  const handleRegisterRedirect = () => {
    navigate('/admin-register');
  };

  if (loading) {
    return (
      <LoadingScreen 
        message="Checking system status..." 
        variant="fullscreen"
        showLogo={true}
      />
    );
  }

  // If no admin exists, show setup required message
  if (adminExists === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-primary-50 to-secondary-50">
        <Card elevation={2} className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-material">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              No Admin Account Found
            </h1>
            
            <p className="text-gray-600 mb-6">
              The system needs to be initialized with an admin account before you can log in.
            </p>
          </div>

          <Button
            onClick={handleRegisterRedirect}
            variant="contained"
            color="primary"
            fullWidth
            size="large"
          >
            Create Admin Account
          </Button>
          
          <div className="mt-4">
            <Button
              onClick={() => navigate('/')}
              variant="outlined"
              fullWidth
              size="small"
            >
              Back to Home
            </Button>
          </div>
        </Card>
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

export default LoginPage;