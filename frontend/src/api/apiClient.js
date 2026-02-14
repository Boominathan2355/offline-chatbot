import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const apiClient = axios.create({
    baseURL: '/api/v1', // Proxied by Vite to http://localhost:8080/api/v1
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const token = state.auth.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401
apiClient.interceptors.response.use(
    (response) => {
        // Standardized ApiResponse handling: extract the 'data' field
        if (response.data && response.data.status === 'success') {
            return response.data.data !== undefined ? response.data.data : response.data;
        }
        return response.data;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            store.dispatch(logout());
        }
        return Promise.reject(error);
    }
);

export default apiClient;
