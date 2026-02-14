package com.aiassistant.controller.chat;

import com.aiassistant.dto.request.SendMessageRequest;
import com.aiassistant.entity.Message;
import com.aiassistant.dto.response.ApiResponse;
import com.aiassistant.dto.response.CreateSessionResponse;
import com.aiassistant.service.chat.ChatService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/chat")
@Tag(name = "Chat", description = "Messaging and session management endpoint")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @Operation(summary = "Send Message", description = "Send a message to the AI and get a streaming response")
    @PostMapping("/send")
    public SseEmitter sendMessage(@org.springframework.web.bind.annotation.RequestBody SendMessageRequest request) {
        return chatService.sendMessage(request);
    }

    @Operation(summary = "Get Chat History", description = "Retrieve all messages for a specific session")
    @GetMapping("/history/{sessionId}")
    public ApiResponse<List<Message>> getHistory(@PathVariable String sessionId) {
        return ApiResponse.success(chatService.getHistory(sessionId));
    }

    @Operation(summary = "Create Session", description = "Initialize a new chat session")
    @PostMapping("/session")
    public ApiResponse<CreateSessionResponse> createSession() {
        return ApiResponse.success(chatService.createSession());
    }

    @Operation(summary = "List Sessions", description = "Get all chat sessions for the current user")
    @GetMapping("/sessions")
    public ApiResponse<List<com.aiassistant.entity.Session>> listSessions() {
        return ApiResponse.success(chatService.listSessions());
    }

    @Operation(summary = "Delete Session", description = "Delete a chat session by ID")
    @DeleteMapping("/session/{sessionId}")
    public ApiResponse<Void> deleteSession(@PathVariable String sessionId) {
        chatService.deleteSession(sessionId);
        return ApiResponse.success(null);
    }

    @Operation(summary = "Rename Session", description = "Rename a chat session")
    @PutMapping("/session/{sessionId}/rename")
    public ApiResponse<com.aiassistant.entity.Session> renameSession(
            @PathVariable String sessionId,
            @RequestBody java.util.Map<String, String> body) {
        return ApiResponse.success(chatService.renameSession(sessionId, body.get("title")));
    }
}
