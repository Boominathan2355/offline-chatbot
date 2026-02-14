import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import modelReducer from './slices/modelSlice';
import agentReducer from './slices/agentSlice';
import pluginReducer from './slices/pluginSlice';
import chatMiddleware from './middleware/chatMiddleware';
import ipcMiddleware from './middleware/ipcMiddleware';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        models: modelReducer,
        agent: agentReducer,
        plugins: pluginReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(chatMiddleware, ipcMiddleware),
});
