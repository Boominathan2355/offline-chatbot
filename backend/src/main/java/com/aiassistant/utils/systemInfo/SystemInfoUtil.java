package com.aiassistant.utils.systemInfo;

import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

@Component
public class SystemInfoUtil {

    public String executeCommand(String command) {
        try {
            Process process = Runtime.getRuntime().exec(new String[]{"/bin/sh", "-c", command});
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                return reader.lines().collect(Collectors.joining("\n"));
            }
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    public String getRamInfo() {
        return executeCommand("free -h | grep Mem | awk '{print $2}'");
    }

    public int getCpuThreads() {
        String threads = executeCommand("nproc");
        try {
            return Integer.parseInt(threads.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    public String getDiskFree() {
        return executeCommand("df -h / | tail -1 | awk '{print $4}'");
    }

    public String getGpuInfo() {
        return executeCommand("nvidia-smi --query-gpu=name --format=csv,noheader || echo 'No NVIDIA GPU'");
    }
}
