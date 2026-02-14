import apiClient from './apiClient';

export const systemApi = {
    getProfile: async () => {
        return await apiClient.get('/system/profile');
    }
};
