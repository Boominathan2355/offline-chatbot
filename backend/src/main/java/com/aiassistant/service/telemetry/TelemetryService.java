package com.aiassistant.service.telemetry;

import com.aiassistant.entity.AgentMetric;
import com.aiassistant.repository.telemetry.AgentMetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelemetryService {

    private final AgentMetricRepository agentMetricRepository;

    public void logAgentExecution(String taskId, String agentName, long durationMs, 
                                 Map<String, Integer> toolUsage, int tokens, String status) {
        AgentMetric metric = AgentMetric.builder()
                .taskId(taskId)
                .agentName(agentName)
                .durationMs(durationMs)
                .toolUsage(toolUsage)
                .tokenCount(tokens)
                .status(status)
                .timestamp(LocalDateTime.now())
                .build();
        
        agentMetricRepository.save(metric);
        log.info("Telemetry: Agent task {} finished in {}ms with status {}", taskId, durationMs, status);
    }

    public void logError(String taskId, String error) {
        log.error("Telemetry Error [{}]: {}", taskId, error);
    }
}
