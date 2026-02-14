import { store } from '../store';
import { registerPlugin, registerExtension } from '../store/slices/pluginSlice';

class PluginRegistry {
    constructor() {
        this.componentMap = new Map(); // Stores actual React components by ID
    }

    /**
     * Register a new plugin
     * @param {Object} manifest - Plugin metadata { id, name, version }
     */
    register(manifest) {
        store.dispatch(registerPlugin(manifest));
        console.log(`[PluginRegistry] Registered: ${manifest.name}`);
    }

    /**
     * Add a sidebar navigation item
     * @param {string} pluginId 
     * @param {Object} item - { label, icon, path, component }
     */
    addSidebarItem(pluginId, item) {
        const extensionId = `${pluginId}:sidebar:${item.label}`;

        // Store component reference locally (non-serializable)
        if (item.component) {
            this.componentMap.set(extensionId, item.component);
        }

        store.dispatch(registerExtension({
            type: 'sidebar',
            extension: {
                id: extensionId,
                pluginId,
                label: item.label,
                path: item.path,
                hasComponent: !!item.component
            }
        }));
    }

    getComponent(extensionId) {
        return this.componentMap.get(extensionId);
    }
}

export const pluginRegistry = new PluginRegistry();
