package com.aiassistant.controller.plugin;

import com.aiassistant.entity.Plugin;
import com.aiassistant.dto.response.ApiResponse;
import com.aiassistant.service.plugin.PluginService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/plugins")
@Tag(name = "Plugins", description = "Plugin registration and execution interface")
@RequiredArgsConstructor
public class PluginController {

    private final PluginService pluginService;

    @Operation(summary = "Register Plugin", description = "Register a new external plugin")
    @PostMapping("/register")
    public ApiResponse<Plugin> registerPlugin(@RequestBody Plugin plugin) {
        return ApiResponse.success(pluginService.register(plugin));
    }

    @Operation(summary = "List Plugins", description = "Get all registered plugins")
    @GetMapping("/list")
    public ApiResponse<List<Plugin>> listPlugins() {
        return ApiResponse.success(pluginService.listPlugins());
    }

    @Operation(summary = "Execute Plugin", description = "Trigger a plugin-specific action")
    @PostMapping("/execute")
    public ApiResponse<String> executePlugin(@RequestBody Map<String, String> payload) {
        String pluginId = payload.get("pluginId");
        String action = payload.get("action");
        String args = payload.get("arguments");
        return ApiResponse.success(pluginService.execute(pluginId, action, args));
    }
}
