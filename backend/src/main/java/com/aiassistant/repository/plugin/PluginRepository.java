package com.aiassistant.repository.plugin;

import com.aiassistant.entity.Plugin;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface PluginRepository extends MongoRepository<Plugin, String> {
    Optional<Plugin> findByName(String name);
}
