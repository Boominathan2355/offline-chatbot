package com.aiassistant.controller.system;

import com.aiassistant.entity.SystemProfile;
import com.aiassistant.dto.response.ApiResponse;
import com.aiassistant.service.system.SystemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/system")
@Tag(name = "System", description = "System profiling and hardware metrics")
@RequiredArgsConstructor
public class SystemController {

    private final SystemService systemService;

    @Operation(summary = "Get System Profile", description = "Get static hardware information (CPU, RAM, Disk)")
    @GetMapping("/profile")
    public ApiResponse<com.aiassistant.entity.SystemProfile> getSystemProfile() {
        return ApiResponse.success(systemService.getProfile());
    }

    @Operation(summary = "Get Runtime Metrics", description = "Get dynamic resource usage (CPU load, Free RAM)")
    @GetMapping("/metrics")
    public ApiResponse<com.aiassistant.dto.response.SystemMetrics> getRuntimeMetrics() {
        return ApiResponse.success(systemService.getMetrics());
    }
}
