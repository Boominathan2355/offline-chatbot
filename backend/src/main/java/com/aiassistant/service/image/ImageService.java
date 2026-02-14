package com.aiassistant.service.image;

import com.aiassistant.dto.request.ImageGenerationRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class ImageService {

    private static final String AI_RUNTIME_URL = "http://localhost:8000";
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String forwardRequest(String path, String method, Object body) {
        try {
            URL url = new URL(AI_RUNTIME_URL + path);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod(method);
            conn.setConnectTimeout(30000); // Higher timeout for generation
            conn.setReadTimeout(120000); // 2 minutes for generation

            if (body != null) {
                conn.setDoOutput(true);
                conn.setRequestProperty("Content-Type", "application/json");
                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = objectMapper.writeValueAsString(body).getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }
            }

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                return sb.toString();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}";
        }
    }

    public String getCatalog() {
        return forwardRequest("/images/catalog", "GET", null);
    }

    public String generateImage(ImageGenerationRequest request) {
        return forwardRequest("/images/generate", "POST", request);
    }

    public String downloadModel(String modelId) {
        // Python expects {"model_id": "..."}
        // Actually python's api/images.py expects ImageModelDownloadRequest which has model_id
        return forwardRequest("/images/download", "POST", java.util.Map.of("model_id", modelId));
    }

    public String getDownloadStatus(String modelId) {
        return forwardRequest("/images/download/" + modelId, "GET", null);
    }

    public String deleteModel(String modelId) {
        return forwardRequest("/images/delete/" + modelId, "DELETE", null);
    }
}
