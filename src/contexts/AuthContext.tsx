import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, logout as apiLogout } from '../lib/api.js';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: any) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if we have a token in localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No token found in localStorage');
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('Token found, validating with server...');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth validation timeout')), 10000)
      );
      
      // Validate token by fetching profile
      const profilePromise = getProfile();
      const profile = await Promise.race([profilePromise, timeoutPromise]);
      console.log('Token validation successful, user authenticated');
      console.log('Raw Profile API response:', profile);
      
      // Check if profile contains required fields
      if (!profile.Id || !profile.Email) {
        throw new Error('Invalid profile response - missing required fields');
      }
      
      // Transform API response (PascalCase) to expected format (camelCase)
      // Handle RoleId as it might be string or number
      let roleId = profile.RoleId;
      if (typeof roleId === 'string' && !isNaN(Number(roleId))) {
        roleId = Number(roleId);
      }
      
      // Always try to extract roleId from JWT as primary source
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          
          console.log('JWT payload:', payload);
          if (payload.roleId) {
            roleId = parseInt(payload.roleId, 10);
            console.log('Extracted roleId from JWT:', roleId);
          }
        }
      } catch (error) {
        console.error('Error extracting roleId from JWT:', error);
      }
      
      const userInfo = {
        id: profile.Id,
        firstName: profile.FirstName || '',
        lastName: profile.LastName || '',
        email: profile.Email,
        roleId: roleId || null
      };
      console.log('Transformed user info:', userInfo);
      console.log('User role ID:', userInfo.roleId, typeof userInfo.roleId);
      setUser(userInfo);
    } catch (error) {
      // Token is invalid or expired
      console.log('Token validation failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: any) => {
    console.log('Login successful, setting user state');
    
    // The token is already stored in localStorage by the API client
    // Just update the user state with the profile data
    const userInfo = {
      id: userData.userId,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      roleId: userData.roleId
    };
    setUser(userInfo);
    
    // Optionally store user info in localStorage for quick access
    localStorage.setItem('user', JSON.stringify(userInfo));
  };

  const logout = async () => {
    console.log('Logging out...');
    try {
      // Call logout API to mark session as inactive
      await apiLogout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local state even if API fails
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      console.log('Logout complete, local state cleared');
    }
  };

  const isAuthenticated = !!user && !!localStorage.getItem('authToken');
  const isAdmin = !!user && user.roleId === 1; // Admin role has roleId = 1
  
  // Add additional debug info
  if (user) {
    console.log('User role check:', {
      roleId: user.roleId,
      roleIdType: typeof user.roleId,
      isRoleId1: user.roleId === 1,
      isAdmin
    });
  }

  console.log('AuthContext state:', { 
    user: user?.email, 
    roleId: user?.roleId,
    isAuthenticated, 
    isAdmin,
    loading,
    hasToken: !!localStorage.getItem('authToken')
  });

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};