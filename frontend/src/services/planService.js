import axios from 'axios';
import { getToken } from '../utils/auth';
import api from './api';

// Configure Axios Interceptor for robust error handling
api.interceptors.response.use(
    response => response,
    error => {
        if (!error.response) {
            return Promise.reject(new Error("Network Error: Unable to connect to the server."));
        }
        return Promise.reject(error);
    }
);

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

// ✅ Use relative path (NOT full URL)
export const getPlans = async () => {
    const response = await api.get('/plans', getAuthHeaders());
    return response.data;
};

export const renamePlan = async (planId, newTitle) => {
    const response = await api.put(`/plans/${planId}`, { title: newTitle }, getAuthHeaders());
    return response.data;
};

export const deletePlan = async (planId) => {
    await api.delete(`/plans/${planId}`, getAuthHeaders());
};