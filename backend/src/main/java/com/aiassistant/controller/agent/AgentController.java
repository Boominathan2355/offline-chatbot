package com.aiassistant.controller.agent;

import com.aiassistant.dto.request.ExecuteAgentRequest;
import com.aiassistant.dto.request.UpdatePermissionRequest;
import com.aiassistant.dto.response.ApiResponse;
import com.aiassistant.service.agent.AgentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/v1/agent")
@Tag(name = "Agent", description = "Autonomous agent task execution and management")
@RequiredArgsConstructor
public class AgentController {

    private final AgentService agentService;

    @Operation(summary = "Execute Task", description = "Trigger an autonomous agent task")
    @PostMapping("/execute")
    public ApiResponse<String> executeTask(@RequestBody ExecuteAgentRequest request) {
        return ApiResponse.success(agentService.execute(request));
    }

    @Operation(summary = "Get Task Logs", description = "Retrieve execution logs for an active agent task")
    @GetMapping("/logs/{taskId}")
    public ApiResponse<List<com.aiassistant.entity.AgentLog>> getTaskLogs(@PathVariable String taskId) {
        return ApiResponse.success(agentService.getLogs(taskId));
    }

    @Operation(summary = "Update Permissions", description = "Approve or deny tool usage permissions")
    @PostMapping("/permissions")
    public ApiResponse<String> updatePermission(@RequestBody UpdatePermissionRequest request) {
        agentService.updatePermission(request.getToolName(), request.getPermissionStatus());
        return ApiResponse.success("Permission updated");
    }

    @GetMapping(value = "/mcp/list", produces = "application/json")
    public ResponseEntity<String> listMcps() {
        return ResponseEntity.ok(agentService.listMcps());
    }

    @PostMapping(value = "/mcp/toggle", produces = "application/json")
    public ResponseEntity<String> toggleMcp(@RequestBody Map<String, Object> request) {
        String mcpId = (String) request.get("mcp_id");
        boolean enabled = (Boolean) request.get("enabled");
        return ResponseEntity.ok(agentService.toggleMcp(mcpId, enabled));
    }

    @PostMapping(value = "/mcp/add", produces = "application/json")
    public ResponseEntity<String> addMcpServer(@RequestBody String config) {
        return ResponseEntity.ok(agentService.addMcpServer(config));
    }

    @DeleteMapping(value = "/mcp/{mcpId}", produces = "application/json")
    public ResponseEntity<String> deleteMcpServer(@PathVariable String mcpId) {
        return ResponseEntity.ok(agentService.deleteMcpServer(mcpId));
    }
}
