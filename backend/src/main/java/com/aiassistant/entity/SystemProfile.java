package com.aiassistant.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "system_profiles")
public class SystemProfile {
    @Id
    private String id;
    private String ram;
    private Integer cpuThreads;
    private String gpu;
    private String vram;
    private String diskFree;
    private LocalDateTime timestamp;
}
