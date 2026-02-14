package com.aiassistant.service.chat;

import com.aiassistant.dto.request.SendMessageRequest;
import com.aiassistant.entity.Message;
import com.aiassistant.entity.Session;
import com.aiassistant.repository.session.SessionRepository;
import com.aiassistant.repository.session.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class ChatService {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private MessageRepository messageRepository;
    
    private final ExecutorService nonBlockingService = Executors.newCachedThreadPool();

    public SseEmitter sendMessage(SendMessageRequest request) {
        SseEmitter emitter = new SseEmitter(60000L); // 60s timeout
        
        // Save user message
        Message userMessage = Message.builder()
                .id(java.util.UUID.randomUUID().toString())
                .sessionId(request.getSessionId())
                .role("user")
                .content(request.getMessage())
                .timestamp(java.time.LocalDateTime.now())
                .build();
        messageRepository.save(userMessage);

        nonBlockingService.execute(() -> {
            StringBuilder assistantResponse = new StringBuilder();
            try {
                // Build JSON payload for AI runtime
                String jsonPayload = String.format(
                    "{\"model\":\"%s\",\"prompt\":\"%s\",\"stream\":true}",
                    request.getModel() != null ? request.getModel() : "default",
                    request.getMessage().replace("\"", "\\\"")
                );

                // Connect to AI runtime
                java.net.URL url = new java.net.URL("http://localhost:8000/chat/send");
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(30000);

                // Send request
                try (java.io.OutputStream os = conn.getOutputStream()) {
                    os.write(jsonPayload.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                }

                // Read streaming response
                try (java.io.BufferedReader reader = new java.io.BufferedReader(
                        new java.io.InputStreamReader(conn.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (line.startsWith("data:")) {
                            String word = line.substring(5); // Remove "data:" prefix
                            assistantResponse.append(word);
                            emitter.send(word);
                        }
                    }
                }
                
                // Save assistant message
                Message assistantMessage = Message.builder()
                        .id(java.util.UUID.randomUUID().toString())
                        .sessionId(request.getSessionId())
                        .role("assistant")
                        .content(assistantResponse.toString())
                        .timestamp(java.time.LocalDateTime.now())
                        .build();
                messageRepository.save(assistantMessage);

                emitter.complete();
            } catch (Exception e) {
                // Fallback to mock response if AI runtime is unavailable
                try {
                    String fallback = "AI runtime is currently unavailable. Please ensure the AI service is running on port 8000. ";
                    for (String word : fallback.split(" ")) {
                        assistantResponse.append(word).append(" ");
                        emitter.send(word + " ");
                        Thread.sleep(100);
                    }

                    // Save assistant message even if it's a fallback
                    Message assistantMessage = Message.builder()
                            .id(java.util.UUID.randomUUID().toString())
                            .sessionId(request.getSessionId())
                            .role("assistant")
                            .content(assistantResponse.toString())
                            .timestamp(java.time.LocalDateTime.now())
                            .build();
                    messageRepository.save(assistantMessage);

                    emitter.complete();
                } catch (Exception ex) {
                    emitter.completeWithError(ex);
                }
            }
        });
        
        return emitter;
    }

    public List<Message> getHistory(String sessionId) {
        return messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
    }

    public List<Session> listSessions() {
        // In a real app, we'd get the current user from SecurityContext
        // For now, return all or filter by a dummy user if needed.
        // Let's try to get the current username.
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return sessionRepository.findAll(); // Simplified for now to ensure visibility
    }

    public void deleteSession(String sessionId) {
        sessionRepository.deleteById(sessionId);
    }

    public Session renameSession(String sessionId, String newTitle) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setTitle(newTitle);
        sessionRepository.save(session);
        return session;
    }

    public com.aiassistant.dto.response.CreateSessionResponse createSession() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        
        Session session = Session.builder()
            .id(java.util.UUID.randomUUID().toString())
            .userId(username)
            .title("New Chat")
            .createdAt(java.time.LocalDateTime.now())
            .modelId("Llama-3-8B-Instruct")
            .build();
        
        sessionRepository.save(session);

        return com.aiassistant.dto.response.CreateSessionResponse.builder()
            .sessionId(session.getId())
            .defaultModel(session.getModelId())
            .createdAt(session.getCreatedAt())
            .build();
    }
}
