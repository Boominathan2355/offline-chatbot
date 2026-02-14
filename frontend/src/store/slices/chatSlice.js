import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatApi } from '../../api/chatApi';

// Async Thunks
export const createSessionThunk = createAsyncThunk('chat/createSession', async () => {
    return await chatApi.createSession();
});

export const fetchSessionsThunk = createAsyncThunk('chat/fetchSessions', async () => {
    return await chatApi.listSessions();
});

export const fetchHistoryThunk = createAsyncThunk('chat/fetchHistory', async (sessionId) => {
    return await chatApi.getHistory(sessionId);
});

export const deleteSessionThunk = createAsyncThunk('chat/deleteSession', async (sessionId) => {
    await chatApi.deleteSession(sessionId);
    return sessionId;
});

export const renameSessionThunk = createAsyncThunk('chat/renameSession', async ({ sessionId, title }) => {
    await chatApi.renameSession(sessionId, title);
    return { sessionId, title };
});

const initialState = {
    sessions: [],
    activeSessionId: null,
    messages: [],
    isStreaming: false,
    selectedModel: '',
    isLoading: false,
    error: null,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setActiveSession: (state, action) => {
            state.activeSessionId = action.payload;
            state.messages = [];
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        updateLastMessage: (state, action) => {
            if (state.messages.length > 0) {
                const lastMsg = state.messages[state.messages.length - 1];
                if (lastMsg.role === 'assistant') {
                    lastMsg.content = action.payload;
                }
            }
        },
        setStreaming: (state, action) => {
            state.isStreaming = action.payload;
        },
        setModel: (state, action) => {
            state.selectedModel = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Session
            .addCase(createSessionThunk.fulfilled, (state, action) => {
                const newSession = {
                    id: action.payload.sessionId,
                    title: 'New Chat',
                    createdAt: action.payload.createdAt
                };
                state.sessions.unshift(newSession);
                state.activeSessionId = newSession.id;
                state.messages = [];
            })
            // Fetch Sessions
            .addCase(fetchSessionsThunk.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSessionsThunk.fulfilled, (state, action) => {
                state.sessions = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchSessionsThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Fetch History
            .addCase(fetchHistoryThunk.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchHistoryThunk.fulfilled, (state, action) => {
                state.messages = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchHistoryThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Delete Session
            .addCase(deleteSessionThunk.fulfilled, (state, action) => {
                const deletedId = action.payload;
                state.sessions = state.sessions.filter(s => s.id !== deletedId);
                if (state.activeSessionId === deletedId) {
                    state.activeSessionId = state.sessions.length > 0 ? state.sessions[0].id : null;
                    state.messages = [];
                }
            })
            // Rename Session
            .addCase(renameSessionThunk.fulfilled, (state, action) => {
                const { sessionId, title } = action.payload;
                const session = state.sessions.find(s => s.id === sessionId);
                if (session) session.title = title;
            });
    }
});

export const {
    setActiveSession,
    addMessage,
    updateLastMessage,
    setStreaming,
    setModel,
    setError
} = chatSlice.actions;

export default chatSlice.reducer;
