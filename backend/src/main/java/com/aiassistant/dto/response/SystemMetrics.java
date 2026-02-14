package com.aiassistant.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SystemMetrics {
    private double tokensPerSecond;
    private double memoryUsageMb;
    private String runtimeStatus; // IDLE, BUSY, OFFLINE
    private double cpuUsagePercent;
}
