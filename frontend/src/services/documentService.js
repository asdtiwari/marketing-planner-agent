import api from './api';

export const uploadKnowledgePdf = async (file) => {
    // We must use FormData to send binary files over HTTP
    const formData = new FormData();
    formData.append('file', file);

    // The interceptor automatically attaches the JWT
    const response = await api.post('/documents/upload/pdf', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const uploadKnowledgeUrl = async (url) => {
    const formData = new FormData();
    formData.append('url', url);

    const response = await api.post('/documents/upload/url', formData, {
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    return response.data;
};