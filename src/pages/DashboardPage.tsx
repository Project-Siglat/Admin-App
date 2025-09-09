import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { getProfile } from '../lib/api.js';
import ProfileManagement from '../components/ProfileManagement.tsx';
import ContactCRUD from '../components/ContactCRUD.tsx';
import UserManagement from '../components/UserManagement.tsx';
import VerificationManagement from '../components/VerificationManagement.tsx';
import TypeOfIncidentManagement from '../components/TypeOfIncidentManagement.tsx';
import Card from '../components/Card.tsx';
import Button from '../components/Button.tsx';
import LoadingScreen from '../components/LoadingScreen.tsx';
import {
    FluentProvider,
    webDarkTheme,
    webLightTheme,
    makeStyles,
    tokens,
    Avatar,
    Text,
    Button as FluentButton,
    Badge
} from '@fluentui/react-components';
import {
    Person20Regular,
    Phone20Regular,
    People20Regular,
    ShieldCheckmark20Regular,
    Alert20Regular,
    SignOut20Regular,
    Navigation20Regular,
    Dismiss20Regular,
    Shield20Filled
} from '@fluentui/react-icons';

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

const useStyles = makeStyles({
    // Modern sidebar styles
    modernSidebar: {
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: '320px',
        backgroundColor: '#2d3748',
        background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        '@media (max-width: 768px)': {
            width: '100vw',
            maxWidth: '320px'
        }
    },
    sidebarClosed: {
        transform: 'translateX(100%)'
    },
    sidebarOpen: {
        transform: 'translateX(0)'
    },
    sidebarHeader: {
        padding: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    sidebarTitle: {
        color: 'white',
        fontSize: '18px',
        fontWeight: '600',
        margin: 0
    },
    closeButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: 'rgba(255, 255, 255, 0.7)',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white'
        }
    },
    userSection: {
        padding: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
    },
    userName: {
        color: 'white',
        fontSize: '16px',
        fontWeight: '600',
        marginTop: '12px',
        marginBottom: '4px'
    },
    sidebarUserRole: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '14px'
    },
    navigation: {
        flex: 1,
        padding: '16px',
        overflowY: 'auto'
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '14px 16px',
        marginBottom: '8px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: 'transparent',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '15px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            transform: 'translateX(4px)'
        }
    },
    navItemActive: {
        backgroundColor: 'rgba(66, 153, 225, 0.2)',
        color: 'white',
        border: '1px solid rgba(66, 153, 225, 0.3)',
        boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)',
        '&:hover': {
            backgroundColor: 'rgba(66, 153, 225, 0.3)',
            transform: 'translateX(0)'
        }
    },
    navIcon: {
        marginRight: '12px',
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center'
    },
    navBadge: {
        marginLeft: 'auto'
    },
    sidebarFooter: {
        padding: '24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },
    logoutButton: {
        width: '100%',
        padding: '12px 16px',
        backgroundColor: 'transparent',
        border: '1px solid rgba(239, 68, 68, 0.5)',
        borderRadius: '8px',
        color: '#f56565',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#f56565'
        }
    },
    appInfo: {
        textAlign: 'center',
        marginTop: '16px',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '12px'
    },
    // Top Bar Styles
    topBar: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
    },
    topBarLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    logoIcon: {
        width: '32px',
        height: '32px',
        backgroundColor: '#4299e1',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: '#3182ce',
            transform: 'scale(1.05)'
        }
    },
    brandText: {
        display: 'flex',
        flexDirection: 'column',
        '@media (max-width: 640px)': {
            display: 'none'
        }
    },
    brandTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#1a202c',
        margin: 0,
        lineHeight: '1.2'
    },
    brandSubtitle: {
        fontSize: '12px',
        color: '#718096',
        margin: 0,
        lineHeight: '1.2'
    },
    topBarRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        '@media (max-width: 640px)': {
            gap: '12px'
        }
    },
    welcomeText: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        '@media (max-width: 768px)': {
            display: 'none'
        }
    },
    welcomeMessage: {
        fontSize: '14px',
        color: '#4a5568',
        margin: 0,
        fontWeight: '500'
    },
    userRole: {
        fontSize: '12px',
        color: '#718096',
        margin: 0
    },
    menuButton: {
        backgroundColor: '#4299e1',
        border: 'none',
        borderRadius: '8px',
        padding: '10px',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(66, 153, 225, 0.2)',
        '&:hover': {
            backgroundColor: '#3182ce',
            boxShadow: '0 4px 8px rgba(66, 153, 225, 0.3)'
        },
        '&:active': {
            transform: 'scale(0.95)'
        }
    },
    overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
        opacity: 0,
        transition: 'opacity 0.3s ease'
    },
    overlayVisible: {
        opacity: 1
    }
});

const DashboardPage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('contacts');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const styles = useStyles();

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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



    // Define all tabs with modern icons
    const tabs = [
        {
            id: 'profile',
            label: 'Profile & Settings',
            icon: <Person20Regular />,
            content: <ProfileManagement />
        },
        {
            id: 'contacts',
            label: 'Emergency Contacts',
            icon: <Phone20Regular />,
            content: <ContactCRUD />
        },
        {
            id: 'users',
            label: 'User Management',
            icon: <People20Regular />,
            content: <UserManagement />
        },
        {
            id: 'verification',
            label: 'Verification Management',
            icon: <ShieldCheckmark20Regular />,
            content: <VerificationManagement />
        },
        {
            id: 'incidents',
            label: 'Incident Types',
            icon: <Alert20Regular />,
            content: <TypeOfIncidentManagement />,
            badge: '●'
        }
    ];

    const getRoleName = (roleId: number) => {
        switch (roleId) {
            case 1: return 'Administrator';
            case 2: return 'User';
            default: return 'Unknown Role';
        }
    };

    const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

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

    return (
        <FluentProvider theme={webLightTheme}>
            <div className="min-h-screen bg-gray-50">
                {/* Top Bar */}
                <div className={styles.topBar}>
                    {/* Left Side - Logo and Brand */}
                    <div className={styles.topBarLeft}>
                        <div className={styles.logo}>
                            <div className={styles.logoIcon}>
                                <Shield20Filled />
                            </div>
                            <div className={styles.brandText}>
                                <h1 className={styles.brandTitle}>SIGLAT</h1>
                                <p className={styles.brandSubtitle}>Emergency Response System</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - User Info and Menu */}
                    <div className={styles.topBarRight}>
                        <div className={styles.welcomeText}>
                            <p className={styles.welcomeMessage}>
                                Welcome, {profile?.firstName || user?.firstName}!
                            </p>
                            <p className={styles.userRole}>
                                {getRoleName(profile?.roleId || user?.roleId || 1)}
                            </p>
                        </div>
                        
                        <Avatar
                            name={`${profile?.firstName || user?.firstName} ${profile?.lastName || user?.lastName}`}
                            size={36}
                            color="colorful"
                        />

                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={styles.menuButton}
                        >
                            <Navigation20Regular />
                        </button>
                    </div>
                </div>

                {/* Sidebar Overlay */}
                {isSidebarOpen && (
                    <div 
                        className={`${styles.overlay} ${isSidebarOpen ? styles.overlayVisible : ''}`}
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Modern Sidebar */}
                <div className={`${styles.modernSidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
                    {/* Sidebar Header */}
                    <div className={styles.sidebarHeader}>
                        <h2 className={styles.sidebarTitle}>Navigation</h2>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className={styles.closeButton}
                        >
                            <Dismiss20Regular />
                        </button>
                    </div>

                    {/* User Section */}
                    <div className={styles.userSection}>
                        <Avatar
                            name={`${profile?.firstName || user?.firstName} ${profile?.lastName || user?.lastName}`}
                            size={56}
                            color="colorful"
                        />
                        <div className={styles.userName}>
                            {profile?.firstName || user?.firstName} {profile?.lastName || user?.lastName}
                        </div>
                        <div className={styles.sidebarUserRole}>
                            {getRoleName(profile?.roleId || user?.roleId || 1)}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className={styles.navigation}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    if (!isDesktop) {
                                        setIsSidebarOpen(false);
                                    }
                                }}
                                className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
                            >
                                <span className={styles.navIcon}>{tab.icon}</span>
                                <span>{tab.label}</span>
                                {tab.badge && activeTab === tab.id && (
                                    <span className={styles.navBadge} style={{ color: '#4299e1' }}>
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Sidebar Footer */}
                    <div className={styles.sidebarFooter}>
                        <button
                            onClick={handleLogout}
                            className={styles.logoutButton}
                        >
                            <SignOut20Regular style={{ marginRight: '8px' }} />
                            Logout
                        </button>
                        <div className={styles.appInfo}>
                            <p>Emergency Response</p>
                            <p style={{ fontWeight: '600' }}>Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className={`transition-all duration-300 ${isSidebarOpen && isDesktop ? 'mr-80' : 'mr-0'}`} style={{ paddingTop: '70px' }}>
                    <div className="p-6">
                        {activeTabContent}
                    </div>
                </div>
            </div>
        </FluentProvider>
    );
};

export default DashboardPage;