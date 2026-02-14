package com.aiassistant.repository.logs;

import com.aiassistant.entity.SystemProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SystemProfileRepository extends MongoRepository<SystemProfile, String> {
}
