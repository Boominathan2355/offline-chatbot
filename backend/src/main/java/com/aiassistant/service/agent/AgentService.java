package com.aiassistant.service.agent;

import com.aiassistant.dto.request.ExecuteAgentRequest;
import com.aiassistant.entity.AgentLog;
import com.aiassistant.repository.agent.AgentLogRepository;
import com.aiassistant.repository.agent.AgentPermissionRepository;
import com.aiassistant.service.telemetry.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgentService {

    private final AgentLogRepository agentLogRepository;
    private final AgentPermissionRepository agentPermissionRepository;
    private final TelemetryService telemetryService;

    public String execute(ExecuteAgentRequest request) {
        String taskId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();

        // Placeholder for agent logic
        AgentLog log = AgentLog.builder()
                .taskId(taskId)
                .sessionId("manual-execution") // In real app, get from context
                .action("EXECUTE_TASK")
                .tool(request.getTools().toString())
                .result("PENDING")
                .permissionFlag("APPROVED") // Auto-approved for MVP
                .timestamp(LocalDateTime.now())
                .content("Starting task: " + request.getTask()) // Added content field
                .build();
        agentLogRepository.save(log);

        // In real impl: restTemplate.postForObject("http://ai-runtime:8000/agent/execute", request, String.class);
        String result = "Agent task sent to runtime: " + request.getTask();

        // 3. Update Log
        log.setResult("SUCCESS");
        agentLogRepository.save(log);

        // 4. Async Telemetry (Simulated)
        new Thread(() -> {
            try {
                Thread.sleep(1000);
                long duration = System.currentTimeMillis() - startTime;
                Map<String, Integer> toolUsage = new HashMap<>();
                request.getTools().forEach(tool -> toolUsage.put(tool, 1));
                telemetryService.logAgentExecution(taskId, "GeneralAgent", duration, toolUsage, 150, "SUCCESS");
            } catch (Exception e) {
                telemetryService.logError(taskId, e.getMessage());
            }
        }).start();

        return result;
    }

    public java.util.List<AgentLog> getLogs(String sessionId) {
        return agentLogRepository.findBySessionId(sessionId);
    }

    public void updatePermission(String toolName, String status) {
        com.aiassistant.entity.AgentPermission permission = agentPermissionRepository.findByToolName(toolName)
                .orElse(com.aiassistant.entity.AgentPermission.builder().toolName(toolName).build());
        
        permission.setPermissionStatus(status);
        agentPermissionRepository.save(permission);
    }
    public String listMcps() {
        return callRuntime("/agent/mcp/list", "GET", null);
    }

    public String toggleMcp(String mcpId, boolean enabled) {
        String jsonBody = "{\"mcp_id\": \"" + mcpId + "\", \"enabled\": " + enabled + "}";
        return callRuntime("/agent/mcp/toggle", "POST", jsonBody);
    }

    public String addMcpServer(String jsonBody) {
        return callRuntime("/agent/mcp/add", "POST", jsonBody);
    }

    public String deleteMcpServer(String mcpId) {
        return callRuntime("/agent/mcp/" + mcpId, "DELETE", null);
    }

    private static final String AI_RUNTIME_URL = "http://localhost:8000";

    private String callRuntime(String endpoint, String method, String jsonBody) {
        try {
            java.net.URL url = new java.net.URL(AI_RUNTIME_URL + endpoint);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod(method);
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(10000);

            if (jsonBody != null) {
                conn.setDoOutput(true);
                conn.setRequestProperty("Content-Type", "application/json");
                try (java.io.OutputStream os = conn.getOutputStream()) {
                    byte[] input = jsonBody.getBytes("utf-8");
                    os.write(input, 0, input.length);
                }
            }

            try (java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(conn.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                return sb.toString();
            }
        } catch (Exception e) {
            return "{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}";
        }
    }
}
