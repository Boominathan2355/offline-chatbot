package com.aiassistant;

import com.aiassistant.dto.request.ExecuteAgentRequest;
import com.aiassistant.service.agent.AgentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import com.aiassistant.controller.agent.AgentController;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AgentController.class)
@org.springframework.security.test.context.support.WithMockUser
class AgentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private com.aiassistant.service.agent.AgentService agentService;

    @MockBean
    private com.aiassistant.service.auth.JwtService jwtService;

    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @Test
    void testExecuteAgent() throws Exception {
        ExecuteAgentRequest request = new ExecuteAgentRequest();
        request.setTask("Analyze this file");
        request.setTools(List.of("file-reader"));
        // request.setRiskLevel("low"); // Assuming mismatch here too
        
        when(agentService.execute(any(ExecuteAgentRequest.class))).thenReturn("Task started");

        mockMvc.perform(post("/api/v1/agent/execute")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data").value("Task started"));
    }
}
