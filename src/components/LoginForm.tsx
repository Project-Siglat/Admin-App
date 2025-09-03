import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import Card from './Card.js';
import LoadingButton from './LoadingButton.tsx';
import TextField from './TextField.js';
import Checkbox from './Checkbox.js';
import { login as apiLogin } from '../lib/api.js';

interface LoginFormProps {
  onLoginSuccess?: (result: any) => void;
  title?: string;
  subtitle?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onLoginSuccess,
  title = "SIGLAT Admin",
  subtitle = "Sign in to your admin account"
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const canSubmit = email && password && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError('');

    try {
      const result = await apiLogin(email, password);
      
      // Update auth context - API returns camelCase
      login({
        userId: result.userId,
        roleId: result.roleId,
        email: email
      });

      // Call success callback if provided
      onLoginSuccess?.(result);

      // Redirect to intended destination or dashboard
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && canSubmit) {
      handleSubmit(event as any);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-primary-50 to-secondary-50">
      <Card elevation={2} className="w-full max-w-sm p-8">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-4 shadow-material">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
              <path d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-3xl font-medium text-primary-700 mb-2">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField
            value={email}
            onChange={setEmail}
            label="Email"
            type="email"
            required
            fullWidth
            disabled={loading}
            onKeyPress={handleKeyPress}
          />

          <TextField
            value={password}
            onChange={setPassword}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            fullWidth
            disabled={loading}
            onKeyPress={handleKeyPress}
          />

          <Checkbox
            checked={showPassword}
            onChange={setShowPassword}
            disabled={loading}
            label="Show password"
          />

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <LoadingButton 
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!canSubmit}
            loadingText="Signing in..."
            className="w-full"
          >
            Sign In
          </LoadingButton>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-blue-600 hover:text-blue-500 underline"
              disabled={loading}
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;