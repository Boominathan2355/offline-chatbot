import apiClient from './apiClient';

export const modelApi = {
    getCatalog: async () => {
        const res = await apiClient.get('/models/catalog');
        return res;
    },

    listModels: async () => {
        return await apiClient.get('/models/list');
    },

    getRecommendations: async () => {
        return await apiClient.get('/models/recommend');
    },

    downloadModel: async (modelId) => {
        return await apiClient.post(`/models/download/${modelId}`);
    },

    getDownloadStatus: async (modelId) => {
        return await apiClient.get(`/models/download/status/${modelId}`);
    },

    cancelDownload: async (modelId) => {
        return await apiClient.post(`/models/download/cancel/${modelId}`);
    },

    deleteModel: async (modelId) => {
        return await apiClient.delete(`/models/delete/${modelId}`);
    },

    runBenchmark: async (modelId) => {
        return await apiClient.post(`/models/benchmark/${modelId}`);
    }
};
