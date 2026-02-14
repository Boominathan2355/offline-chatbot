package com.aiassistant.repository.model;

import com.aiassistant.entity.ModelMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface ModelRepository extends MongoRepository<ModelMetadata, String> {
    Optional<ModelMetadata> findByName(String name);
    // Custom queries if needed
}
