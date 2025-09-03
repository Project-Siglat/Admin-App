import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext.js';
import { sendAdminOtp, verifyAdminOtp, createAdminWithOtp } from '../lib/api.js';
import Card from '../components/Card.js';
import Button from '../components/Button.js';
import TextField from '../components/TextField.js';
import CircularProgress from '../components/CircularProgress.js';

type RegistrationStep = 'email' | 'otp' | 'password';

const AdminRegistrationPage: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<RegistrationStep>('email');
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        password: false,
        confirmPassword: false
    });
    const [otpExpiry, setOtpExpiry] = useState<Date | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);
    
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const validateEmail = () => {
        if (!formData.email) {
            showError('Email is required');
            return false;
        }

        if (!formData.email.includes('@')) {
            showError('Please enter a valid email address');
            return false;
        }

        return true;
    };

    const validateOtp = () => {
        if (!formData.otp) {
            showError('OTP is required');
            return false;
        }

        if (formData.otp.length !== 6) {
            showError('OTP must be 6 digits');
            return false;
        }

        return true;
    };

    const validatePassword = () => {
        if (!formData.password) {
            showError('Password is required');
            return false;
        }

        if (formData.password.length < 8) {
            showError('Password must be at least 8 characters long');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            showError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateEmail()) return;
        
        try {
            setLoading(true);
            
            const result = await sendAdminOtp(formData.email);
            
            showSuccess('OTP sent to your email address');
            setCurrentStep('otp');
            setOtpExpiry(new Date(result.expiresAt));
            
            // Set cooldown for resend button
            setResendCooldown(120); // 2 minutes
            const cooldownInterval = setInterval(() => {
                setResendCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(cooldownInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
        } catch (error) {
            console.error('Failed to send OTP:', error);
            showError('Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateOtp()) return;
        
        try {
            setLoading(true);
            
            await verifyAdminOtp(formData.email, formData.otp);
            
            showSuccess('OTP verified successfully!');
            setCurrentStep('password');
            
        } catch (error) {
            console.error('Failed to verify OTP:', error);
            showError('Invalid OTP. Please check and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validatePassword()) return;
        
        try {
            setLoading(true);
            
            await createAdminWithOtp(formData.email, formData.otp, formData.password);
            
            showSuccess('Admin account created successfully! You can now log in.');
            
            // Redirect to login page after successful registration
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (error) {
            console.error('Failed to create admin:', error);
            showError('Failed to create admin account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        
        try {
            setLoading(true);
            
            const result = await sendAdminOtp(formData.email);
            
            showSuccess('New OTP sent to your email address');
            setOtpExpiry(new Date(result.expiresAt));
            
            // Reset cooldown
            setResendCooldown(120);
            const cooldownInterval = setInterval(() => {
                setResendCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(cooldownInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
        } catch (error) {
            console.error('Failed to resend OTP:', error);
            showError('Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const getPasswordStrengthText = (strength: number) => {
        switch (strength) {
            case 0:
            case 1: return { text: 'Very Weak', color: 'text-red-600' };
            case 2: return { text: 'Weak', color: 'text-orange-600' };
            case 3: return { text: 'Fair', color: 'text-yellow-600' };
            case 4: return { text: 'Strong', color: 'text-green-600' };
            case 5: return { text: 'Very Strong', color: 'text-green-700' };
            default: return { text: '', color: '' };
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 'email': return 'Verify Email Address';
            case 'otp': return 'Enter Verification Code';
            case 'password': return 'Create Admin Account';
            default: return 'Create Admin Account';
        }
    };

    const getStepSubtitle = () => {
        switch (currentStep) {
            case 'email': return 'Enter your email address to receive a verification code';
            case 'otp': return `Enter the 6-digit code sent to ${formData.email}`;
            case 'password': return 'Set up your admin password to complete registration';
            default: return 'Set up the first administrator account for the SIGLAT Emergency Response System';
        }
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const strengthInfo = getPasswordStrengthText(passwordStrength);

    return (
        <div className="min-h-screen flex items-center justify-center p-5 bg-gray-100">
            <Card elevation={2} className="w-full max-w-md p-8">
                <div className="mb-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {getStepTitle()}
                    </h1>
                    
                    <p className="text-gray-600">
                        {getStepSubtitle()}
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-600">Step {currentStep === 'email' ? 1 : currentStep === 'otp' ? 2 : 3} of 3</span>
                        <span className="text-xs text-gray-500">
                            {currentStep === 'email' ? 'Email' : currentStep === 'otp' ? 'Verification' : 'Password'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: currentStep === 'email' ? '33%' : currentStep === 'otp' ? '66%' : '100%' }}
                        ></div>
                    </div>
                </div>

                {/* Step 1: Email Input */}
                {currentStep === 'email' && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <TextField
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={(value) => handleInputChange('email', value)}
                            placeholder="admin@example.com"
                            required
                            fullWidth
                            autoComplete="email"
                        />

                        <div className="pt-4">
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                disabled={!formData.email || loading}
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <CircularProgress size="small" />
                                        <span>Sending OTP...</span>
                                    </div>
                                ) : (
                                    'Send Verification Code'
                                )}
                            </Button>
                        </div>
                    </form>
                )}

                {/* Step 2: OTP Verification */}
                {currentStep === 'otp' && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <TextField
                            label="Verification Code"
                            type="text"
                            value={formData.otp}
                            onChange={(value) => handleInputChange('otp', value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="123456"
                            required
                            fullWidth
                            maxLength={6}
                            autoComplete="one-time-code"
                        />

                        <div className="text-center text-sm text-gray-600">
                            {otpExpiry && (
                                <p>Code expires at {otpExpiry.toLocaleTimeString()}</p>
                            )}
                        </div>

                        <div className="pt-4 space-y-3">
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                disabled={formData.otp.length !== 6 || loading}
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <CircularProgress size="small" />
                                        <span>Verifying...</span>
                                    </div>
                                ) : (
                                    'Verify Code'
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="outlined"
                                fullWidth
                                size="small"
                                disabled={resendCooldown > 0 || loading}
                                onClick={handleResendOtp}
                            >
                                {resendCooldown > 0 
                                    ? `Resend in ${formatTime(resendCooldown)}`
                                    : 'Resend Code'
                                }
                            </Button>
                        </div>
                    </form>
                )}

                {/* Step 3: Password Setup */}
                {currentStep === 'password' && (
                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                        <div className="relative">
                            <TextField
                                label="Password"
                                type={showPasswords.password ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(value) => handleInputChange('password', value)}
                                placeholder="Enter a strong password"
                                required
                                fullWidth
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('password')}
                                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.password ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>

                        {formData.password && (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                        <div 
                                            className={`h-1.5 rounded-full transition-all ${
                                                passwordStrength <= 1 ? 'bg-red-500' :
                                                passwordStrength <= 2 ? 'bg-orange-500' :
                                                passwordStrength <= 3 ? 'bg-yellow-500' :
                                                passwordStrength <= 4 ? 'bg-green-500' : 'bg-green-600'
                                            }`}
                                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className={`text-xs ${strengthInfo.color}`}>
                                        {strengthInfo.text}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Use 8+ characters with uppercase, lowercase, numbers, and symbols
                                </p>
                            </div>
                        )}

                        <div className="relative">
                            <TextField
                                label="Confirm Password"
                                type={showPasswords.confirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(value) => handleInputChange('confirmPassword', value)}
                                placeholder="Confirm your password"
                                required
                                fullWidth
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirmPassword')}
                                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.confirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                disabled={!formData.password || !formData.confirmPassword || loading}
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <CircularProgress size="small" />
                                        <span>Creating Admin Account...</span>
                                    </div>
                                ) : (
                                    'Create Admin Account'
                                )}
                            </Button>
                        </div>
                    </form>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center text-gray-400">
                        <span className="text-sm">SIGLAT Emergency Response System v1.0</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AdminRegistrationPage;