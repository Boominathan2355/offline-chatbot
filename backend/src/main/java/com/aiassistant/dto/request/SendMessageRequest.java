package com.aiassistant.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SendMessageRequest {
  private String sessionId;
  private String message;
  private String model;
  private boolean agentMode;
}
