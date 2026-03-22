import api from './api';
import { setToken } from '../utils/auth';

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
        setToken(response.data.access_token);
    }
    return response.data;
};

export const register = async (email, password, orgName) => {
    const response = await api.post('/auth/register', { 
        email, 
        password, 
        org_name: orgName 
    });
    if (response.data.access_token) {
        setToken(response.data.access_token);
    }
    return response.data;
};