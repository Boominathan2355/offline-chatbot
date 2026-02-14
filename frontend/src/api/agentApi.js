import apiClient from './apiClient';

export const agentApi = {
    executeTask: async (task, tools) => {
        // Calling backend which proxies to Python runtime or directly to runtime if proxy configured
        // Based on vite.config.js, /agent proxies to http://localhost:8000
        // But apiClient has baseURL '/api'.
        // If backend has an endpoint /agent/execute, we use that.
        // In Backend AgentService, we have logic to call runtime.
        // Let's assume we call backend /agent/execute which forwards to Runtime.

        // Adjusting to match likely Backend Controller
        return await apiClient.post('/agent/execute', { task, tools });
    },

    // MCP Management
    listMcps: async () => {
        const res = await apiClient.get('/agent/mcp/list');
        return res;
    },

    toggleMcp: async (mcpId, enabled) => {
        return await apiClient.post('/agent/mcp/toggle', { mcp_id: mcpId, enabled });
    },

    addMcp: async (config) => {
        return await apiClient.post('/agent/mcp/add', config);
    },

    deleteMcp: async (mcpId) => {
        return await apiClient.delete(`/agent/mcp/${mcpId}`);
    }
};
