package com.aiassistant.service.plugin;

import com.aiassistant.entity.Plugin;
import com.aiassistant.repository.plugin.PluginRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PluginService {

    @Autowired
    private PluginRepository pluginRepository;

    public Plugin register(Plugin plugin) {
        plugin.setRegisteredAt(java.time.LocalDateTime.now());
        plugin.setEnabled(true);
        return pluginRepository.save(plugin);
    }

    public List<Plugin> listPlugins() {
        return pluginRepository.findAll();
    }

    public String execute(String pluginId, String action, String args) {
        // Placeholder: Provide execution logic via Python Runtime or internal handler
        return "Executed " + action + " on plugin " + pluginId + " with args: " + args;
    }
}
