package com.aiassistant.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "agent_permissions")
public class AgentPermission {
    @Id
    private String id;
    private String toolName;
    private String permissionStatus; // ALLOWED, BLOCKED, ASK
}
