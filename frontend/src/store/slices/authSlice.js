import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    token: localStorage.getItem('token') || null, // Basic persistence
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.token = action.payload.accessToken;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.error = null;
            localStorage.setItem('token', action.payload.accessToken);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        loginFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    },
});

export const { loginSuccess, loginFailure, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
