import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { getProfile } from '../lib/api.js';
import Tabs from '../components/Tabs.tsx';
import ProfileManagement from '../components/ProfileManagement.tsx';
import ContactCRUD from '../components/ContactCRUD.tsx';
import UserManagement from '../components/UserManagement.tsx';
import VerificationManagement from '../components/VerificationManagement.tsx';
import Card from '../components/Card.tsx';
import Button from '../components/Button.tsx';
import { SkeletonProfile, SkeletonCard } from '../components/Skeleton.tsx';
import LoadingScreen from '../components/LoadingScreen.tsx';

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
}

const DashboardPage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
            );
            
            const profilePromise = getProfile();
            const data = await Promise.race([profilePromise, timeoutPromise]);
            console.log('Dashboard profile fetch successful:', data);
            setProfile(data);
        } catch (err) {
            console.error('Dashboard profile fetch error:', err);
            setError('Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/login');
        }
    };

    const getRoleName = (roleId: number) => {
        switch (roleId) {
            case 1: return 'Admin';
            case 2: return 'User';
            default: return 'Unknown';
        }
    };

    // Define tab icons (using emoji for simplicity)
    const getTabIcon = (iconName: string) => {
        const icons: { [key: string]: string } = {
            profile: '👤',
            contacts: '📞',
            users: '👥',
            verification: '✅'
        };
        return <span>{icons[iconName]}</span>;
    };

    if (loading) {
        return (
            <LoadingScreen 
                message="Loading dashboard..." 
                variant="fullscreen"
                showLogo={true}
            />
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Card>
                    <div className="text-center text-red-600 p-8">
                        <p className="text-xl mb-4">{error}</p>
                        <div className="space-x-4">
                            <button 
                                onClick={fetchProfile}
                                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Retry
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // Define all tabs
    const tabs = [
        {
            id: 'profile',
            label: 'Profile & Settings',
            icon: getTabIcon('profile'),
            content: <ProfileManagement />
        },
        {
            id: 'contacts',
            label: 'Emergency Contacts',
            icon: getTabIcon('contacts'),
            content: <ContactCRUD />
        },
        {
            id: 'users',
            label: 'User Management',
            icon: getTabIcon('users'),
            content: <UserManagement />
        },
        {
            id: 'verification',
            label: 'Verification Management',
            icon: getTabIcon('verification'),
            content: <VerificationManagement />
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">SIGLAT Dashboard</h1>
                        <p className="text-gray-600">Emergency Response System</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700">
                            Welcome, {profile?.firstName || user?.firstName}!
                        </span>
                        <Button
                            onClick={handleLogout}
                            variant="outlined"
                            color="secondary"
                            size="small"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <Tabs tabs={tabs} defaultTab="profile" />
            </div>
        </div>
    );
};

export default DashboardPage;