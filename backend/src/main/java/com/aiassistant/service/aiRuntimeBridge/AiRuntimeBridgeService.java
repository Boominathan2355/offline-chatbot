package com.aiassistant.service.aiRuntimeBridge;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class AiRuntimeBridgeService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String AI_RUNTIME_URL = "http://localhost:8000";

    public InferResponse infer(String model, String prompt) {
        InferRequest request = new InferRequest();
        request.setModel(model);
        request.setPrompt(prompt);
        request.setStream(false);

        return restTemplate.postForObject(AI_RUNTIME_URL + "/infer", request, InferResponse.class);
    }

    @Data
    public static class InferRequest {
        private String model;
        private String prompt;
        private boolean stream;
    }

    @Data
    public static class InferResponse {
        private String model;
        private String response;
        private String status;
    }
}
