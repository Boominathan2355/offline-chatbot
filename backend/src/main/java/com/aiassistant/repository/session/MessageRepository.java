package com.aiassistant.repository.session; // Keeping in session package as discussed

import com.aiassistant.entity.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findBySessionIdOrderByTimestampAsc(String sessionId);
}
