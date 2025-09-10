import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, logout as apiLogout } from '../lib/api.js';
import { TokenStorage } from '../lib/tokenStorage.js';
import { ENV_CONFIG } from '../config/env.ts';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  role: string; // Add role name
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
      // Check if we have a token in storage (localStorage + cookies)
      const token = TokenStorage.getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Check if token is expired
      if (TokenStorage.isTokenExpired()) {
        TokenStorage.clearTokens();
        setUser(null);
        setLoading(false);
        return;
      }

      // Try to get user info from stored token first
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        
        // Check if token is expired based on exp claim
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          TokenStorage.clearTokens();
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Extract user info from JWT
        const userInfo = {
          id: payload.sub || payload.userId || payload.id,
          firstName: payload.firstName || payload.given_name || '',
          lastName: payload.lastName || payload.family_name || '',
          email: payload.email || payload.username,
          roleId: payload.roleId ? parseInt(payload.roleId, 10) : 2,
          role: payload.role || 'user'
        };
        
        setUser(userInfo);
        setLoading(false);
        return;
      } catch (jwtError) {
        console.log('Could not parse JWT, falling back to API call');
      }
      
      // Fallback: validate token by fetching profile (only if JWT parsing failed)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth validation timeout')), 10000)
      );
      
      const profilePromise = getProfile();
      const profile = await Promise.race([profilePromise, timeoutPromise]);
      
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
      
      // Extract role name from profile or JWT
      let roleName = profile.Role || '';
      
      // Always try to extract role info from JWT as primary source
      try {
        const token = TokenStorage.getToken();
        if (token) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          
          if (payload.roleId) {
            roleId = parseInt(payload.roleId, 10);
          }
          if (payload.role) {
            roleName = payload.role;
          }
        }
      } catch (error) {
        console.error('Error extracting role info from JWT:', error);
      }
      
      const userInfo = {
        id: profile.Id || profile.id,
        firstName: profile.FirstName || profile.firstName || '',
        lastName: profile.LastName || profile.lastName || '',
        email: profile.Email || profile.email,
        roleId: roleId || null,
        role: roleName || 'user'
      };
      setUser(userInfo);
    } catch (error) {
      // Token is invalid or expired
      TokenStorage.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: any) => {
    
    // Extract role info from userData and JWT token
    let roleId = userData.roleId;
    let roleName = userData.role || '';
    
    try {
      const token = TokenStorage.getToken();
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        
        // Try different possible claim names for roleId and role
        roleId = roleId || payload.roleId || payload.role || payload.RoleId || payload.Role;
        roleName = roleName || payload.role || payload.Role || '';
        
        if (typeof roleId === 'string' && !isNaN(Number(roleId))) {
          roleId = Number(roleId);
        }
        
      }
    } catch (error) {
      console.error('Error extracting role info from JWT during login:', error);
    }
    
    // The token is already stored in localStorage by the API client
    // Just update the user state with the profile data
    const userInfo = {
      id: userData.userId,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      roleId: roleId || ENV_CONFIG.defaultRoleId, // Default role from environment
      role: roleName || 'admin' // Default to admin role
    };
    
    setUser(userInfo);
    
    // Optionally store user info in localStorage for quick access
    localStorage.setItem('user', JSON.stringify(userInfo));
  };

  const logout = async () => {
    try {
      // Call logout API to mark session as inactive
      await apiLogout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local state even if API fails
      setUser(null);
      TokenStorage.clearTokens();
    }
  };

  const isAuthenticated = !!user && TokenStorage.hasToken();
  const isAdmin = !!user && (user.roleId === ENV_CONFIG.adminRoleId || user.role?.toLowerCase() === 'admin');
  
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