package com.aiassistant;

import com.aiassistant.dto.request.SendMessageRequest;
import com.aiassistant.dto.response.CreateSessionResponse;
import com.aiassistant.service.chat.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import com.aiassistant.controller.chat.ChatController;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ChatController.class)
@org.springframework.security.test.context.support.WithMockUser
class ChatIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private com.aiassistant.service.chat.ChatService chatService;

    @MockBean
    private com.aiassistant.service.auth.JwtService jwtService;

    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @Test
    void testCreateSession() throws Exception {
        CreateSessionResponse mockResponse = CreateSessionResponse.builder()
                .sessionId("session-123")
                .defaultModel("Llama-3")
                .build();

        when(chatService.createSession()).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/chat/session")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.sessionId").value("session-123"));
    }
}
