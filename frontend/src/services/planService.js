import axios from 'axios';
import { getToken } from '../utils/auth';

const API_URL = 'http://127.0.0.1:8000/api/v1/plans';

// Configure Axios Interceptor for robust error handling
axios.interceptors.response.use(
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

export const getPlans = async () => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
};

export const renamePlan = async (planId, newTitle) => {
    const response = await axios.put(`${API_URL}/${planId}`, { title: newTitle }, getAuthHeaders());
    return response.data;
};

export const deletePlan = async (planId) => {
    await axios.delete(`${API_URL}/${planId}`, getAuthHeaders());
};