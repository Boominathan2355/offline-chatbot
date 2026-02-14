package com.aiassistant.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "models")
public class ModelMetadata {
    @Id
    private String id;
    private String name;
    private String size;
    private String ramRequired;
    private String gpuRequired;
    private String status; // DOWNLOADED, DOWNLOADING, NOT_DOWNLOADED
    private Double benchmarkScore;
    private Double tokensPerSec;
    private Double latencyMs;
    private String ramUsage;
    private String downloadPath;
}
