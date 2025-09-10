// Token storage utility that handles both localStorage and cookies
// for maximum compatibility and security

export class TokenStorage {
    // Set token in cookies (primary) and localStorage (backup)
    static setToken(token, expiresAt) {
        if (!token) return;

        // Set expiration - default to 7 days if not provided
        const expires = expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        
        // Store in cookies first (primary storage)
        this.setCookie('authToken', token, expires);
        
        // Store in localStorage as backup
        localStorage.setItem('authToken', token);
        localStorage.setItem('tokenExpiresAt', expires);
    }

    // Get token from cookies (primary) with localStorage fallback
    static getToken() {
        // Try cookies first (primary storage)
        let token = this.getCookie('authToken');
        
        // Fallback to localStorage if cookie is empty
        if (!token) {
            token = localStorage.getItem('authToken');
            // If found in localStorage, restore to cookie
            if (token) {
                const expires = localStorage.getItem('tokenExpiresAt') || 
                               new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                this.setCookie('authToken', token, expires);
            }
        }
        
        return token;
    }

    // Set refresh token in cookies (primary) and localStorage (backup)
    static setRefreshToken(refreshToken, expiresAt) {
        if (!refreshToken) return;

        // Set expiration - default to 30 days for refresh token
        const expires = expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        // Store in cookies first (primary storage)
        this.setCookie('refreshToken', refreshToken, expires);
        
        // Store in localStorage as backup
        localStorage.setItem('refreshToken', refreshToken);
    }

    // Get refresh token from cookies (primary) with localStorage fallback
    static getRefreshToken() {
        // Try cookies first (primary storage)
        let token = this.getCookie('refreshToken');
        
        // Fallback to localStorage if cookie is empty
        if (!token) {
            token = localStorage.getItem('refreshToken');
            // If found in localStorage, restore to cookie
            if (token) {
                const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
                this.setCookie('refreshToken', token, expires);
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
        } else {
            // Default to 7 days if no expiration provided
            const defaultExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            cookieString += `; expires=${defaultExpiry.toUTCString()}`;
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