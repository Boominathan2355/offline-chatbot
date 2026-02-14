package com.aiassistant.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "agent_logs")
public class AgentLog {
    @Id
    private String id;
    private String taskId;
    private String sessionId;
    private String action;
    private String tool;
    private String result;
    private String content;
    private String permissionFlag; // APPROVED, DENIED
    private LocalDateTime timestamp;
}
