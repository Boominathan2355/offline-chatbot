package com.aiassistant.dto.request;

import lombok.Data;

@Data
public class ImageGenerationRequest {
    private String model_id;
    private String prompt;
    private String negative_prompt;
    private Integer steps;
    private Integer width;
    private Integer height;
    private Double cfg_scale;
    private Integer seed;
}
