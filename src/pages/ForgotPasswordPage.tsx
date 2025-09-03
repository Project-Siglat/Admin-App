import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import LoadingButton from '../components/LoadingButton';
import TextField from '../components/TextField';
import { useToast } from '../contexts/ToastContext';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch('http://localhost:5000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        showToast('OTP sent to your email successfully!', 'success');
        setStep('otp');
      } else {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to send OTP');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch('http://localhost:5000/api/v1/auth/verify-forgot-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, verificationCode: otpCode })
      });

      if (response.ok) {
        showToast('OTP verified successfully!', 'success');
        setStep('reset');
      } else {
        const errorData = await response.text();
        throw new Error(errorData || 'Invalid or expired OTP');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Invalid or expired OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch('http://localhost:5000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          verificationCode: otpCode, 
          newPassword 
        })
      });

      if (response.ok) {
        showToast('Password reset successfully!', 'success');
        navigate('/login');
      } else {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to reset password');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSendOtp} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
        <p className="text-gray-600">Enter your email address and we'll send you an OTP to reset your password.</p>
      </div>

      <TextField
        value={email}
        onChange={setEmail}
        label="Email"
        type="email"
        required
        fullWidth
        disabled={loading}
      />

      <LoadingButton 
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        disabled={!email}
        loadingText="Sending OTP..."
        className="w-full"
      >
        Send OTP
      </LoadingButton>

      <div className="text-center">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-sm text-blue-600 hover:text-blue-500 underline"
          disabled={loading}
        >
          Back to Login
        </button>
      </div>
    </form>
  );

  const renderOtpStep = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter OTP</h2>
        <p className="text-gray-600">We've sent a verification code to {email}</p>
      </div>

      <TextField
        value={otpCode}
        onChange={setOtpCode}
        label="Verification Code"
        type="text"
        required
        fullWidth
        disabled={loading}
        placeholder="Enter 6-digit code"
      />

      <LoadingButton 
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        disabled={!otpCode}
        loadingText="Verifying..."
        className="w-full"
      >
        Verify OTP
      </LoadingButton>

      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={handleSendOtp}
          className="text-sm text-blue-600 hover:text-blue-500 underline"
          disabled={loading}
        >
          Resend OTP
        </button>
        <br />
        <button
          type="button"
          onClick={() => setStep('email')}
          className="text-sm text-gray-600 hover:text-gray-500 underline"
          disabled={loading}
        >
          Change Email
        </button>
      </div>
    </form>
  );

  const renderResetStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Set New Password</h2>
        <p className="text-gray-600">Enter your new password for {email}</p>
      </div>

      <TextField
        value={newPassword}
        onChange={setNewPassword}
        label="New Password"
        type={showPassword ? 'text' : 'password'}
        required
        fullWidth
        disabled={loading}
      />

      <TextField
        value={confirmPassword}
        onChange={setConfirmPassword}
        label="Confirm New Password"
        type={showPassword ? 'text' : 'password'}
        required
        fullWidth
        disabled={loading}
      />

      <div className="flex items-center">
        <input
          id="show-password"
          type="checkbox"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          disabled={loading}
        />
        <label htmlFor="show-password" className="ml-2 text-sm text-gray-700">
          Show passwords
        </label>
      </div>

      <LoadingButton 
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        disabled={!newPassword || !confirmPassword}
        loadingText="Resetting..."
        className="w-full"
      >
        Reset Password
      </LoadingButton>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <Card elevation={2} className="w-full max-w-md p-8">
        {step === 'email' && renderEmailStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'reset' && renderResetStep()}

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

export default ForgotPasswordPage;