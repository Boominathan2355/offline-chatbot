package com.aiassistant.repository.session;

import com.aiassistant.entity.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChatMessageRepository extends MongoRepository<Message, String> {
    List<Message> findBySessionIdOrderByTimestampAsc(String sessionId);
}
