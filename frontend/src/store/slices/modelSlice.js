import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { modelApi } from '../../api/modelApi';
import { imageApi } from '../../api/imageApi';

// Async Thunks
export const fetchCatalog = createAsyncThunk('models/fetchCatalog', async () => {
    const res = await modelApi.getCatalog();
    // Normalize models from the unified catalog
    return (res.models || []).map(m => {
        if (m.type === 'image') {
            return { ...m, supportsVision: m.supportsVision || false, supportsThinking: false };
        }
        return m;
    });
});

export const fetchModels = createAsyncThunk('models/fetchList', async () => {
    return await modelApi.listModels();
});

export const fetchRecommendations = createAsyncThunk('models/fetchRecommendations', async () => {
    return await modelApi.getRecommendations();
});

export const downloadModelThunk = createAsyncThunk('models/download', async (modelId) => {
    const res = await modelApi.downloadModel(modelId);
    return { modelId, ...res };
});

export const fetchDownloadStatus = createAsyncThunk('models/fetchDownloadStatus', async (modelId) => {
    const res = await modelApi.getDownloadStatus(modelId);
    return { modelId, ...res };
});

export const deleteModelThunk = createAsyncThunk('models/deleteModel', async (modelId, { dispatch }) => {
    await modelApi.deleteModel(modelId);
    dispatch(fetchCatalog()); // Refresh catalog to update installed status
    return modelId;
});

export const cancelDownloadThunk = createAsyncThunk('models/cancelDownload', async (modelId) => {
    await modelApi.cancelDownload(modelId);
    return modelId;
});

const initialState = {
    catalog: [],         // Full catalog from AI runtime
    installedModels: [],
    recommendedModels: [],
    isLoading: false,
    error: null,
    downloadStatus: {}, // { 'modelId': { status, progress, error } }
};

const modelSlice = createSlice({
    name: 'models',
    initialState,
    reducers: {
        updateDownloadStatus: (state, action) => {
            const { modelId, status, progress } = action.payload;
            state.downloadStatus[modelId] = { status, progress };
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Catalog
            .addCase(fetchCatalog.fulfilled, (state, action) => {
                state.catalog = action.payload;
                // Resume polling for models marked as downloading in catalog
                action.payload.forEach(model => {
                    const ds = model.download_status;
                    if (ds && (ds.status === 'downloading' || ds.status === 'started')) {
                        state.downloadStatus[model.id] = {
                            ...ds,
                            status: 'downloading' // Force status to 'downloading' to trigger UI polling
                        };
                    }
                });
            })
            // Fetch Models
            .addCase(fetchModels.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchModels.fulfilled, (state, action) => {
                state.installedModels = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchModels.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Fetch Recommendations
            .addCase(fetchRecommendations.fulfilled, (state, action) => {
                state.recommendedModels = action.payload;
            })
            // Download Model
            .addCase(downloadModelThunk.pending, (state, action) => {
                const modelId = action.meta.arg;
                state.downloadStatus[modelId] = { status: 'downloading', progress: 0 };
            })
            .addCase(downloadModelThunk.fulfilled, (state, action) => {
                const { modelId } = action.payload;
                if (action.payload.status === 'already_installed') {
                    state.downloadStatus[modelId] = { status: 'completed', progress: 100 };
                }
            })
            .addCase(downloadModelThunk.rejected, (state, action) => {
                const modelId = action.meta.arg;
                state.downloadStatus[modelId] = { status: 'failed', progress: 0 };
                state.error = action.error.message;
            })
            // Download Status Polling
            .addCase(fetchDownloadStatus.fulfilled, (state, action) => {
                const { modelId, status, progress } = action.payload;
                state.downloadStatus[modelId] = {
                    ...action.payload,
                    status,
                    progress: progress || 0
                };

                // If completed, mark in catalog
                if (status === 'completed') {
                    const catalogItem = state.catalog.find(m => m.id === modelId);
                    if (catalogItem) catalogItem.installed = true;
                }
            })
            // Delete Model
            .addCase(deleteModelThunk.pending, (state, action) => {
                state.deletingModelId = action.meta.arg;
            })
            .addCase(deleteModelThunk.fulfilled, (state, action) => {
                state.deletingModelId = null;
                const catalogItem = state.catalog.find(m => m.id === action.payload);
                if (catalogItem) catalogItem.installed = false;
            })
            .addCase(deleteModelThunk.rejected, (state) => {
                state.deletingModelId = null;
            })
            // Cancel Download
            .addCase(cancelDownloadThunk.fulfilled, (state, action) => {
                const modelId = action.payload;
                state.downloadStatus[modelId] = { status: 'cancelled', progress: 0 };
            });
    },
});

export const { updateDownloadStatus } = modelSlice.actions;
export default modelSlice.reducer;
