import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminExists } from '../lib/api.js';
import Card from '../components/Card.tsx';
import Button from '../components/Button.tsx';
import LoadingScreen from '../components/LoadingScreen.tsx';

const HomePage: React.FC = () => {
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

  const handleSetupRedirect = () => {
    navigate('/admin-register');
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <LoadingScreen 
        message="Initializing SIGLAT System..." 
        variant="fullscreen"
        showLogo={true}
      />
    );
  }

  if (adminExists === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-primary-50 to-secondary-50">
        <Card elevation={2} className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-4 shadow-material">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
                <path d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="white"/>
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              System Setup Required
            </h1>
            
            <p className="text-gray-600 mb-6">
              SIGLAT Emergency Response System needs to be initialized. Please set up the first admin account.
            </p>
          </div>

          <Button
            onClick={handleSetupRedirect}
            variant="contained"
            color="primary"
            fullWidth
            size="large"
          >
            Setup Admin Account
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-primary-50 to-secondary-50">
      <Card elevation={2} className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-4 shadow-material">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
              <path d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="white"/>
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            SIGLAT
          </h1>
          
          <p className="text-gray-600 mb-6">
            Emergency Response System Administration
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleLoginRedirect}
            variant="contained"
            color="primary"
            fullWidth
            size="large"
          >
            Access Admin Panel
          </Button>
          
          <div className="text-sm text-gray-500">
            <p>Secure access to emergency response management</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center text-gray-400">
            <span className="text-sm">Emergency Response System v1.0</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HomePage;