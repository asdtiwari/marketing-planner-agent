import axios from 'axios';
import { getToken, removeToken } from '../utils/auth';

// Create a configured Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach the token to every outgoing request automatically
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle global 401 Unauthorized errors (e.g., token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // If the backend rejects the token, wipe the session and force a login
            removeToken();
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;