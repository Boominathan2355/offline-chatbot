import apiClient from './apiClient';

export const chatApi = {
    createSession: async () => {
        return await apiClient.post('/chat/session');
    },

    listSessions: async () => {
        return await apiClient.get('/chat/sessions');
    },

    getHistory: async (sessionId) => {
        return await apiClient.get(`/chat/history/${sessionId}`);
    },

    deleteSession: async (sessionId) => {
        return await apiClient.delete(`/chat/session/${sessionId}`);
    },

    renameSession: async (sessionId, title) => {
        return await apiClient.put(`/chat/session/${sessionId}/rename`, { title });
    },

    sendMessage: (request) => {
        return `/api/v1/chat/send`;
    }
};
