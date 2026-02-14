package com.aiassistant.repository.agent;

import com.aiassistant.entity.AgentLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AgentLogRepository extends MongoRepository<AgentLog, String> {
    List<AgentLog> findBySessionId(String sessionId);
}
