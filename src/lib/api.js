// API utility functions
const API_BASE_URL = 'http://localhost:5000/api';

export async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
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

export async function login(email, password) {
    return await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}