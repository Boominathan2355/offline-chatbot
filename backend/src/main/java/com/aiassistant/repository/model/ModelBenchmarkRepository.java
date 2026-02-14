package com.aiassistant.repository.model;

import com.aiassistant.entity.ModelBenchmark;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ModelBenchmarkRepository extends MongoRepository<ModelBenchmark, String> {
    List<ModelBenchmark> findByModelId(String modelId);
}
