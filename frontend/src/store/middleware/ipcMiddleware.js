export const selectDirectory = () => ({
    type: 'server/selectDirectory'
});

export const ipcMiddleware = store => next => async action => {
    // Check if running in Electron
    if (!window.electronAPI) {
        return next(action);
    }

    if (action.type === 'server/selectDirectory') {
        try {
            const result = await window.electronAPI.selectDirectory();
            if (result) {
                // Dispatch success action or return result if needed
                // For now, we might want to update a setting in the store
                // store.dispatch(updateModelPath(result)); 
                return result; // Return for component to handle if awaited
            }
        } catch (error) {
            console.error('IPC Error:', error);
        }
    }

    return next(action);
};

export default ipcMiddleware;
