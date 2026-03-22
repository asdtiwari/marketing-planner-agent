import api from './api';

export const generateMarketingPlan = async (goal) => {
    // This endpoint maps to our FastAPI /api/v1/agent/plan route
    const response = await api.post('/agent/plan', { goal });
    return response.data;
};