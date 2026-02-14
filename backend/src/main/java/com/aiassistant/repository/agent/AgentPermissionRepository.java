package com.aiassistant.repository.agent;

import com.aiassistant.entity.AgentPermission;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface AgentPermissionRepository extends MongoRepository<AgentPermission, String> {
    Optional<AgentPermission> findByToolName(String toolName);
}
