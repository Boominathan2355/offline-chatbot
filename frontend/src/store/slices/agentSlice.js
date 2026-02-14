import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { agentApi } from '../../api/agentApi';

export const executeAgentTask = createAsyncThunk('agent/execute', async ({ task, tools }, { rejectWithValue }) => {
    try {
        return await agentApi.executeTask(task, tools);
    } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
    }
});

const initialState = {
    isRunning: false,
    logs: [],
    lastResult: null,
    error: null,
    allowedTools: ['filesystem_read', 'searchengine'],
};

const agentSlice = createSlice({
    name: 'agent',
    initialState,
    reducers: {
        addLog: (state, action) => {
            state.logs.push({
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                message: action.payload.message,
                level: action.payload.level || 'info'
            });
        },
        clearLogs: (state) => {
            state.logs = [];
            state.lastResult = null;
            state.error = null;
        },
        toggleTool: (state, action) => {
            const toolName = action.payload;
            if (state.allowedTools.includes(toolName)) {
                state.allowedTools = state.allowedTools.filter(t => t !== toolName);
            } else {
                state.allowedTools.push(toolName);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(executeAgentTask.pending, (state) => {
                state.isRunning = true;
                state.error = null;
            })
            .addCase(executeAgentTask.fulfilled, (state, action) => {
                state.isRunning = false;
                state.lastResult = action.payload.result || action.payload;
            })
            .addCase(executeAgentTask.rejected, (state, action) => {
                state.isRunning = false;
                state.error = action.payload || "Execution failed";
            });
    }
});

export const { addLog, clearLogs, toggleTool } = agentSlice.actions;
export default agentSlice.reducer;
