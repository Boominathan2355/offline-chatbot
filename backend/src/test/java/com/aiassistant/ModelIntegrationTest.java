package com.aiassistant;

import com.aiassistant.controller.model.ModelController;
import com.aiassistant.dto.request.DownloadModelRequest;
import com.aiassistant.service.model.ModelService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ModelController.class)
@org.springframework.security.test.context.support.WithMockUser
class ModelIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private com.aiassistant.service.model.ModelService modelService;

    @MockBean
    private com.aiassistant.service.auth.JwtService jwtService;

    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @Test
    void testDownloadModel() throws Exception {
        DownloadModelRequest request = new DownloadModelRequest();
        request.setModelName("Llama-2-7B");
        // request.setQuantization("Q4_K_M"); // Assuming this field doesn't exist or isn't in constructor
        
        doNothing().when(modelService).downloadModel(any(DownloadModelRequest.class));

        mockMvc.perform(post("/api/v1/models/download")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"));
    }
}
