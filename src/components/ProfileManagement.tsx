import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { getProfile, getMyLoginHistory, updateProfile, changePassword } from '../lib/api.js';
import Card from './Card.tsx';
import Button from './Button.tsx';
import TextField from './TextField.tsx';

interface UserProfile {
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    roleId: number;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    createdAt: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
}

interface ProfileData {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    gender: string;
    dateOfBirth: string;
}

interface LoginHistoryEntry {
    id: string;
    ipAddress: string;
    userAgent: string;
    loginTimestamp: string;
    logoutTimestamp?: string;
    loginStatus: string;
    failureReason?: string;
    isActive: boolean;
}

const ProfileManagement: React.FC = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();
    const [activeSection, setActiveSection] = useState<'profile' | 'history'>('profile');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [editProfile, setEditProfile] = useState<ProfileData>({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        gender: '',
        dateOfBirth: ''
    });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (activeSection === 'history') {
            fetchLoginHistory();
        }
    }, [activeSection]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getProfile();
            
            setProfile({
                id: data.Id || data.id,
                firstName: data.FirstName || data.firstName || '',
                middleName: data.MiddleName || data.middleName || '',
                lastName: data.LastName || data.lastName || '',
                email: data.Email || data.email || '',
                phoneNumber: data.PhoneNumber || data.phoneNumber || '',
                address: data.Address || data.address || '',
                gender: data.Gender || data.gender || '',
                dateOfBirth: data.DateOfBirth || data.dateOfBirth || '',
                roleId: data.RoleId || data.roleId || 0,
                isEmailVerified: data.IsEmailVerified || data.isEmailVerified || false,
                isPhoneVerified: data.IsPhoneVerified || data.isPhoneVerified || false,
                createdAt: data.CreatedAt || data.createdAt || ''
            });
            
            setEditProfile({
                firstName: data.FirstName || data.firstName || '',
                middleName: data.MiddleName || data.middleName || '',
                lastName: data.LastName || data.lastName || '',
                email: data.Email || data.email || '',
                phoneNumber: data.PhoneNumber || data.phoneNumber || '',
                address: data.Address || data.address || '',
                gender: data.Gender || data.gender || '',
                dateOfBirth: data.DateOfBirth || data.dateOfBirth ? (data.DateOfBirth || data.dateOfBirth).split('T')[0] : ''
            });
            
        } catch (error) {
            console.error('ProfileManagement - failed to load profile:', error);
            showError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const fetchLoginHistory = async () => {
        try {
            const data = await getMyLoginHistory();
            setLoginHistory(data);
        } catch (error) {
            console.error('Failed to fetch login history:', error);
        }
    };

    const getRoleName = (roleId: number) => {
        switch (roleId) {
            case 1: return 'Admin';
            case 2: return 'User';
            case 3: return 'Ambulance';
            case 4: return 'PNP';
            case 5: return 'BFP';
            default: return 'Unknown';
        }
    };

    const handleInputChange = (field: keyof ProfileData, value: string) => {
        setEditProfile(prev => ({ ...prev, [field]: value }));
    };

    const handlePasswordChange = (field: keyof typeof passwords, value: string) => {
        setPasswords(prev => ({ ...prev, [field]: value }));
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            
            // The API controller fetches the user first and updates fields, 
            // so we only need to send the fields we want to update
            const profileUpdateData = {
                firstName: editProfile.firstName,
                middleName: editProfile.middleName,
                lastName: editProfile.lastName,
                address: editProfile.address,
                gender: editProfile.gender,
                phoneNumber: editProfile.phoneNumber,
                email: editProfile.email,
                roleId: profile?.roleId || 1,
                dateOfBirth: editProfile.dateOfBirth ? new Date(editProfile.dateOfBirth).toISOString() : profile?.dateOfBirth,
                // Add a placeholder hashPass to satisfy validation - API will override this with existing hash
                hashPass: "placeholder"
            };
            
            // Call the real API to update profile
            await updateProfile(profileUpdateData);
            
            showSuccess('Profile updated successfully!');
            await fetchProfile(); // Refresh profile data
        } catch (error) {
            console.error('Failed to update profile:', error);
            showError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const validatePasswords = () => {
        if (!passwords.currentPassword) {
            showError('Current password is required');
            return false;
        }
        
        if (passwords.newPassword.length < 8) {
            showError('New password must be at least 8 characters long');
            return false;
        }
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            showError('New passwords do not match');
            return false;
        }
        
        if (passwords.currentPassword === passwords.newPassword) {
            showError('New password must be different from current password');
            return false;
        }
        
        return true;
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validatePasswords()) return;
        
        try {
            setSaving(true);
            
            // Call the real API to change password - API now validates current password
            await changePassword(passwords.currentPassword, passwords.newPassword);
            
            showSuccess('Password changed successfully!');
            setPasswords({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Failed to change password:', error);
            // Check if it's a current password validation error
            if (error.message && error.message.includes('Current password is incorrect')) {
                showError('Current password is incorrect. Please try again.');
            } else {
                showError('Failed to change password. Please try again.');
            }
        } finally {
            setSaving(false);
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getStatusBadge = (status: string) => {
        const statusClasses = {
            'Success': 'bg-green-100 text-green-800',
            'Failed': 'bg-red-100 text-red-800',
            'Error': 'bg-yellow-100 text-yellow-800',
            'Admin Created': 'bg-blue-100 text-blue-800'
        };
        
        return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800';
    };

    if (loading && !profile) {
        return (
            <Card>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </Card>
        );
    }

    const passwordStrength = getPasswordStrength(passwords.newPassword);
    const strengthInfo = getPasswordStrengthText(passwordStrength);

    return (
        <div className="space-y-6">
            {/* Navigation Tabs */}
            <Card>
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6 py-4">
                        {[
                            { id: 'profile', label: 'Profile & Settings', icon: '👤' },
                            { id: 'history', label: 'Login History', icon: '📋' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSection(tab.id as any)}
                                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeSection === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </Card>

            {/* Content Area */}
            <Card>
                <div className="p-6">
                    {activeSection === 'profile' && (
                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold text-gray-800">Profile & Settings</h2>
                            
                            {/* Overview Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Account Overview</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    {/* Profile Summary */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-800 mb-3">Personal Information</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Name:</span>
                                                <span className="font-medium">
                                                    {profile?.firstName} {profile?.middleName} {profile?.lastName}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Email:</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium">{profile?.email}</span>
                                                    {profile?.isEmailVerified && (
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✓</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Phone:</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium">{profile?.phoneNumber}</span>
                                                    {profile?.isPhoneVerified && (
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✓</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Role:</span>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                    {getRoleName(profile?.roleId || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Status */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-800 mb-3">Account Status</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Email Verification</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    profile?.isEmailVerified 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {profile?.isEmailVerified ? 'Verified' : 'Unverified'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Phone Verification</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    profile?.isPhoneVerified 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {profile?.isPhoneVerified ? 'Verified' : 'Unverified'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-2">
                                                Member since: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Profile Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Edit Profile</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <TextField
                                        label="First Name"
                                        value={editProfile.firstName}
                                        onChange={(value) => handleInputChange('firstName', value)}
                                        required
                                        fullWidth
                                    />

                                    <TextField
                                        label="Middle Name"
                                        value={editProfile.middleName}
                                        onChange={(value) => handleInputChange('middleName', value)}
                                        fullWidth
                                    />

                                    <TextField
                                        label="Last Name"
                                        value={editProfile.lastName}
                                        onChange={(value) => handleInputChange('lastName', value)}
                                        required
                                        fullWidth
                                    />

                                    <TextField
                                        label="Phone Number"
                                        value={editProfile.phoneNumber}
                                        onChange={(value) => handleInputChange('phoneNumber', value)}
                                        fullWidth
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Gender <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={editProfile.gender}
                                            onChange={(e) => handleInputChange('gender', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>

                                    <TextField
                                        label="Date of Birth"
                                        type="date"
                                        value={editProfile.dateOfBirth}
                                        onChange={(value) => handleInputChange('dateOfBirth', value)}
                                        fullWidth
                                    />

                                    <div className="md:col-span-2 lg:col-span-3">
                                        <TextField
                                            label="Address"
                                            value={editProfile.address}
                                            onChange={(value) => handleInputChange('address', value)}
                                            fullWidth
                                            multiline
                                            rows={2}
                                        />
                                    </div>

                                    <div className="md:col-span-2 lg:col-span-3">
                                        <TextField
                                            label="Email (Read Only)"
                                            type="email"
                                            value={editProfile.email}
                                            onChange={(value) => handleInputChange('email', value)}
                                            fullWidth
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-4">
                                    <Button
                                        onClick={fetchProfile}
                                        variant="outlined"
                                        disabled={saving}
                                        size="small"
                                    >
                                        Reset
                                    </Button>
                                    
                                    <Button
                                        onClick={handleSaveProfile}
                                        variant="contained"
                                        color="primary"
                                        disabled={saving}
                                        size="small"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>

                            {/* Security Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Security Settings</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-800 mb-4">Change Password</h4>
                                    <form onSubmit={handleChangePassword} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="relative">
                                                <TextField
                                                    label="Current Password"
                                                    type={showPasswords.current ? 'text' : 'password'}
                                                    value={passwords.currentPassword}
                                                    onChange={(value) => handlePasswordChange('currentPassword', value)}
                                                    required
                                                    fullWidth
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('current')}
                                                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 text-sm"
                                                >
                                                    {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                                                </button>
                                            </div>

                                            <div className="relative">
                                                <TextField
                                                    label="New Password"
                                                    type={showPasswords.new ? 'text' : 'password'}
                                                    value={passwords.newPassword}
                                                    onChange={(value) => handlePasswordChange('newPassword', value)}
                                                    required
                                                    fullWidth
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 text-sm"
                                                >
                                                    {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                                                </button>
                                            </div>

                                            <div className="relative">
                                                <TextField
                                                    label="Confirm Password"
                                                    type={showPasswords.confirm ? 'text' : 'password'}
                                                    value={passwords.confirmPassword}
                                                    onChange={(value) => handlePasswordChange('confirmPassword', value)}
                                                    required
                                                    fullWidth
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 text-sm"
                                                >
                                                    {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {passwords.newPassword && (
                                            <div className="max-w-md">
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
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Use 8+ characters with uppercase, lowercase, numbers, and symbols
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex justify-end space-x-4">
                                            <Button
                                                type="button"
                                                variant="outlined"
                                                onClick={() => {
                                                    setPasswords({
                                                        currentPassword: '',
                                                        newPassword: '',
                                                        confirmPassword: ''
                                                    });
                                                }}
                                                disabled={saving}
                                                size="small"
                                            >
                                                Reset
                                            </Button>
                                            
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                disabled={saving}
                                                size="small"
                                            >
                                                {saving ? 'Changing...' : 'Update Password'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'history' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Login History</h2>
                            <div className="space-y-4">
                                {loginHistory.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No login history available
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {loginHistory.slice(0, 10).map((entry) => (
                                            <div
                                                key={entry.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(entry.loginStatus)}`}>
                                                            {entry.loginStatus}
                                                        </span>
                                                        <span className="text-sm text-gray-600">
                                                            {formatDate(entry.loginTimestamp)}
                                                        </span>
                                                        {entry.isActive && (
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                                Current Session
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-1 text-sm text-gray-500">
                                                        IP: {entry.ipAddress}
                                                    </div>
                                                    {entry.failureReason && (
                                                        <div className="mt-1 text-sm text-red-600">
                                                            {entry.failureReason}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ProfileManagement;