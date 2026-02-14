package com.aiassistant.repository.session;

import com.aiassistant.entity.Session;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChatSessionRepository extends MongoRepository<Session, String> {
    List<Session> findByUserId(String userId);
}
