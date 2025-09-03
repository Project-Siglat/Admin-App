import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.tsx';
import Button from '../components/Button.tsx';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <Card elevation={2} className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          {/* Lock Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h1>
          
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Please log in with administrator credentials.
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
            Go to Login
          </Button>
          
          <div className="text-sm text-gray-500">
            <p>Need help? Contact your administrator.</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center text-gray-400">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 1L5 6v4a8.001 8.001 0 0010 0V6l-5-5z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">SIGLAT Emergency Response System</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;