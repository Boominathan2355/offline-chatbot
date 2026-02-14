package com.aiassistant.repository.telemetry;

import com.aiassistant.entity.AgentMetric;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgentMetricRepository extends MongoRepository<AgentMetric, String> {
    Optional<AgentMetric> findByTaskId(String taskId);
}
