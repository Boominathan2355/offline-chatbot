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
@Document(collection = "model_benchmarks")
public class ModelBenchmark {
    @Id
    private String id;
    private String modelId;
    private LocalDateTime timestamp;
    
    // Metrics
    private Double tokensPerSec;
    private Double latencyMs;
    private Double ramUsageMb;
    private Double qualityScore; // Optional future use
    private String notes;
}
