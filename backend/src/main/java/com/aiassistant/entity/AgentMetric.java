package com.aiassistant.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "agent_metrics")
public class AgentMetric {
    @Id
    private String id;
    private String taskId;
    private String agentName;
    private long durationMs;
    private Map<String, Integer> toolUsage;
    private int tokenCount;
    private String status; // SUCCESS, FAILED, TIMEOUT
    private String errorMessage;
    private LocalDateTime timestamp;
}
