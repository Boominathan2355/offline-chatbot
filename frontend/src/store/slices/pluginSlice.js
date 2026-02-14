import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    activePlugins: [], // List of plugin IDs
    installedPlugins: [], // Metadata of installed plugins
    uiExtensions: {
        sidebar: [], // { id, label, icon, path }
        settings: [], // { id, label, component }
        tools: []     // { id, name, description }
    }
};

const pluginSlice = createSlice({
    name: 'plugins',
    initialState,
    reducers: {
        registerPlugin: (state, action) => {
            const plugin = action.payload; // { id, name, version, ... }
            if (!state.installedPlugins.find(p => p.id === plugin.id)) {
                state.installedPlugins.push(plugin);
                state.activePlugins.push(plugin.id); // Auto-activate for now
            }
        },
        registerExtension: (state, action) => {
            const { type, extension } = action.payload;
            // type: 'sidebar', 'settings', 'tools'
            if (state.uiExtensions[type]) {
                state.uiExtensions[type].push(extension);
            }
        },
        togglePlugin: (state, action) => {
            const pluginId = action.payload;
            if (state.activePlugins.includes(pluginId)) {
                state.activePlugins = state.activePlugins.filter(id => id !== pluginId);
            } else {
                state.activePlugins.push(pluginId);
            }
        }
    }
});

export const { registerPlugin, registerExtension, togglePlugin } = pluginSlice.actions;
export default pluginSlice.reducer;
