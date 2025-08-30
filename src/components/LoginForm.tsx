import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import TextField from './TextField';
import Checkbox from './Checkbox';
import CircularProgress from './CircularProgress';

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

  const canSubmit = email && password && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError('');

    try {
      // Simulate API call
      const result = { token: 'mock-token', user: { email } };
      localStorage.setItem('authToken', result.token);
      onLoginSuccess?.(result);
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
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-white to-gray-50">
      <Card elevation={2} className="w-full max-w-sm p-8">
        <div className="text-center mb-8">
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

          <Button 
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={!canSubmit}
            size="large"
          >
            {loading ? (
              <>
                <CircularProgress size="small" />
                <span className="ml-2">Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;