package com.aiassistant.service.system;

import com.aiassistant.entity.SystemProfile;
import org.springframework.stereotype.Service;
import oshi.SystemInfo;
import oshi.hardware.GlobalMemory;
import oshi.hardware.HardwareAbstractionLayer;
import java.io.File;
import java.time.LocalDateTime;

@Service
public class SystemService {

    private final SystemInfo systemInfo = new SystemInfo();

    public SystemProfile getProfile() {
        HardwareAbstractionLayer hardware = systemInfo.getHardware();
        GlobalMemory memory = hardware.getMemory();
        
        long totalRam = memory.getTotal();
        long availableRam = memory.getAvailable();
        long usedRam = totalRam - availableRam;
        
        File root = new File("/");
        long totalDisk = root.getTotalSpace();
        long freeDisk = root.getFreeSpace();

        return SystemProfile.builder()
                .cpuThreads(hardware.getProcessor().getLogicalProcessorCount())
                .ram(formatBytes(usedRam) + " / " + formatBytes(totalRam))
                .diskFree(formatBytes(freeDisk))
                // GPU info is harder with OSHI, usually requires OSHI's GraphicsCard list or calling nvidia-smi via shell
                .gpu("N/A (Requires native call)") 
                .timestamp(LocalDateTime.now())
                .build();
    }

    private String formatBytes(long bytes) {
        long gb = 1024 * 1024 * 1024;
        return String.format("%.2f GB", (double) bytes / gb);
    }

    public long getTotalMemoryBytes() {
        return systemInfo.getHardware().getMemory().getTotal();
    }

    public com.aiassistant.dto.response.SystemMetrics getMetrics() {
        HardwareAbstractionLayer hardware = systemInfo.getHardware();
        GlobalMemory memory = hardware.getMemory();
        
        long totalRam = memory.getTotal();
        long availableRam = memory.getAvailable();
        long usedRam = totalRam - availableRam;
        
        double memoryUsageMb = (double) usedRam / (1024 * 1024);
        
        // Mocking runtime stats for now as Python service is not connected
        return com.aiassistant.dto.response.SystemMetrics.builder()
                .tokensPerSecond(0.0) // Placeholder
                .memoryUsageMb(memoryUsageMb)
                .runtimeStatus("IDLE") // Placeholder
                .cpuUsagePercent(0.0) // Placeholder (requires tick tracking)
                .build();
    }
}
