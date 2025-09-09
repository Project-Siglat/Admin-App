// API utility functions
import { TokenStorage } from './tokenStorage.js';
import { ENV_CONFIG } from '../config/env.ts';

const API_BASE_URL = `${ENV_CONFIG.apiUrl}/api/v1`;

// Get JWT token from storage (localStorage + cookies)
const getAuthToken = () => {
    return TokenStorage.getToken();
};

// Decode JWT token to extract claims
const decodeJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

export async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    let token = getAuthToken();
    
    // Check if token is expired and try to refresh
    if (token && TokenStorage.isTokenExpired()) {
        try {
            await refreshAuthToken();
            token = getAuthToken(); // Get the new token
        } catch (error) {
            // Refresh failed, clear tokens
            TokenStorage.clearTokens();
            throw new Error('Session expired. Please login again.');
        }
    }
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    // Add Authorization header with Bearer token if available
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Allow override with token from options (for specific cases)
    if (options.token) {
        config.headers.Authorization = `Bearer ${options.token}`;
    }

    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            // Handle specific error cases
            if (response.status === 404) {
                throw new Error('API endpoint not found. Please check if the server is running.');
            }
            if (response.status === 401) {
                // If 401, try to refresh token once
                if (!options.isRetry) {
                    try {
                        await refreshAuthToken();
                        // Retry the request with new token
                        return await apiRequest(endpoint, { ...options, isRetry: true });
                    } catch (error) {
                        // Refresh failed, clear tokens
                        TokenStorage.clearTokens();
                        throw new Error('Session expired. Please login again.');
                    }
                }
            }
            if (response.status === 400) {
                // Try to get detailed error message
                try {
                    const errorData = await response.json();
                    if (typeof errorData === 'string') {
                        throw new Error(errorData);
                    }
                    if (errorData.message) {
                        throw new Error(errorData.message);
                    }
                    if (errorData.errors) {
                        const firstError = Object.values(errorData.errors)[0];
                        throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
                    }
                } catch (parseError) {
                    // If we can't parse the error, get text
                    const errorText = await response.text();
                    throw new Error(errorText || 'Bad request');
                }
            }
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
    } catch (error) {
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Unable to connect to the API server. Please check your connection and ensure the server is running.');
        }
        throw error;
    }
}

export async function checkAdminExists() {
    try {
        return await apiRequest('/auth/admin-exists');
    } catch (error) {
        console.error('Error checking admin existence:', error);
        return { exists: false };
    }
}

export async function createAdmin(email, password) {
    return await apiRequest('/auth/create-admin', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

export async function sendAdminOtp(email) {
    return await apiRequest('/auth/send-admin-otp', {
        method: 'POST',
        body: JSON.stringify({ email })
    });
}

export async function verifyAdminOtp(email, verificationCode) {
    return await apiRequest('/auth/verify-admin-otp', {
        method: 'POST',
        body: JSON.stringify({ email, verificationCode })
    });
}

export async function createAdminWithOtp(email, verificationCode, password) {
    return await apiRequest('/auth/create-admin-with-otp', {
        method: 'POST',
        body: JSON.stringify({ email, verificationCode, password })
    });
}

export async function login(email, password) {
    const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    // Store tokens using enhanced storage (localStorage + cookies)
    if (result.AccessToken || result.accessToken) {
        const token = result.AccessToken || result.accessToken;
        const refreshToken = result.RefreshToken || result.refreshToken;
        const expiresAt = result.AccessTokenExpiresAt || result.accessTokenExpiresAt;
        const refreshExpiresAt = result.RefreshTokenExpiresAt || result.refreshTokenExpiresAt;

        TokenStorage.setToken(token, expiresAt);
        TokenStorage.setRefreshToken(refreshToken, refreshExpiresAt);
    }
    
    return result;
}

async function refreshAuthToken() {
    const refreshToken = TokenStorage.getRefreshToken();
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
        throw new Error('Token refresh failed');
    }

    const result = await response.json();
    
    // Store new tokens using enhanced storage
    const token = result.AccessToken || result.accessToken;
    const newRefreshToken = result.RefreshToken || result.refreshToken;
    const expiresAt = result.AccessTokenExpiresAt || result.accessTokenExpiresAt;
    const refreshExpiresAt = result.RefreshTokenExpiresAt || result.refreshTokenExpiresAt;

    TokenStorage.setToken(token, expiresAt);
    TokenStorage.setRefreshToken(newRefreshToken, refreshExpiresAt);
    
    return result;
}

export async function logout() {
    try {
        await apiRequest('/auth/logout', {
            method: 'POST'
        });
        
        // Revoke refresh token
        const refreshToken = TokenStorage.getRefreshToken();
        if (refreshToken) {
            await fetch(`${API_BASE_URL}/auth/revoke`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });
        }
    } finally {
        // Always clear tokens even if logout API fails
        TokenStorage.clearTokens();
    }
}

export async function getProfile() {
    const result = await apiRequest('/auth/profile');
    return result;
}

export async function getMyLoginHistory() {
    return await apiRequest('/auth/my-login-history');
}

export async function updateProfile(profileData) {
    return await apiRequest('/iam/update', {
        method: 'POST',
        body: JSON.stringify(profileData)
    });
}

export async function changePassword(currentPassword, newPassword) {
    return await apiRequest(`/iam/change-pass?currentPassword=${encodeURIComponent(currentPassword)}&newPassword=${encodeURIComponent(newPassword)}`, {
        method: 'POST'
    });
}

export async function getLoginLogs() {
    return await apiRequest('/auth/login-logs');
}

// Contact API functions
export async function getContacts() {
    return await apiRequest('/admin/contact');
}

export async function createContact(contact) {
    return await apiRequest('/admin/contact', {
        method: 'POST',
        body: JSON.stringify(contact)
    });
}

export async function updateContact(contact) {
    return await apiRequest('/admin/contact', {
        method: 'PUT',
        body: JSON.stringify(contact)
    });
}

export async function deleteContact(contactId) {
    return await apiRequest(`/admin/contact?Id=${contactId}`, {
        method: 'DELETE'
    });
}

// User Management API functions
export async function getUserList() {
    return await apiRequest('/admin/userlist');
}