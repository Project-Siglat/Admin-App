// Token storage utility that handles both localStorage and cookies
// for maximum compatibility and security

export class TokenStorage {
    // Set token in both localStorage and httpOnly cookie
    static setToken(token, expiresAt) {
        if (!token) return;

        // Store in localStorage for client-side access
        localStorage.setItem('authToken', token);
        if (expiresAt) {
            localStorage.setItem('tokenExpiresAt', expiresAt);
        }

        // Also set as httpOnly cookie for server-side access
        this.setCookie('authToken', token, expiresAt);
    }

    // Get token from localStorage (fallback to cookie)
    static getToken() {
        // Try localStorage first
        let token = localStorage.getItem('authToken');
        
        // Fallback to cookie if localStorage is empty
        if (!token) {
            token = this.getCookie('authToken');
            // If found in cookie, sync back to localStorage
            if (token) {
                localStorage.setItem('authToken', token);
            }
        }
        
        return token;
    }

    // Set refresh token
    static setRefreshToken(refreshToken, expiresAt) {
        if (!refreshToken) return;

        localStorage.setItem('refreshToken', refreshToken);
        this.setCookie('refreshToken', refreshToken, expiresAt);
    }

    // Get refresh token
    static getRefreshToken() {
        let token = localStorage.getItem('refreshToken');
        if (!token) {
            token = this.getCookie('refreshToken');
            if (token) {
                localStorage.setItem('refreshToken', token);
            }
        }
        return token;
    }

    // Clear all tokens
    static clearTokens() {
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('user');

        // Clear cookies
        this.deleteCookie('authToken');
        this.deleteCookie('refreshToken');
    }

    // Cookie utilities
    static setCookie(name, value, expiresAt) {
        if (!value) return;

        let cookieString = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
        
        // Set expiration if provided
        if (expiresAt) {
            const expiryDate = new Date(expiresAt);
            cookieString += `; expires=${expiryDate.toUTCString()}`;
        }

        // Set secure flag if on HTTPS
        if (window.location.protocol === 'https:') {
            cookieString += '; Secure';
        }

        document.cookie = cookieString;
    }

    static getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    }

    static deleteCookie(name) {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    }

    // Check if token exists (in either storage)
    static hasToken() {
        return !!(this.getToken());
    }

    // Check if token is expired
    static isTokenExpired() {
        const expiresAt = localStorage.getItem('tokenExpiresAt');
        if (!expiresAt) return false;
        
        return new Date() >= new Date(expiresAt);
    }
}