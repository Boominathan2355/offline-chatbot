package com.aiassistant.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateSessionResponse {
    private String sessionId;
    private String defaultModel;
    private java.time.LocalDateTime createdAt;
}
