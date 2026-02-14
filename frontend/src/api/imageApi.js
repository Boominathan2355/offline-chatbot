
import apiClient from './apiClient';

export const imageApi = {
    getCatalog: async () => {
        const response = await apiClient.get('/images/catalog');
        return response.models || [];
    },

    generateImage: async (params) => {
        // params: { model_id, prompt, negative_prompt, steps, width, height, cfg_scale, seed }
        const response = await apiClient.post('/images/generate', params);
        return response;
    },

    downloadModel: async (modelId) => {
        const response = await apiClient.post('/images/download', { model_id: modelId });
        return response;
    },

    getDownloadStatus: async (modelId) => {
        const response = await apiClient.get(`/images/download/${modelId}`);
        return response;
    },

    deleteModel: async (modelId) => {
        const response = await apiClient.delete(`/images/delete/${modelId}`);
        return response;
    }
};
