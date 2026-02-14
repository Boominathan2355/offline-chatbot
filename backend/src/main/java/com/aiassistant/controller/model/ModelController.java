package com.aiassistant.controller.model;

import com.aiassistant.dto.request.DownloadModelRequest;
import com.aiassistant.entity.ModelMetadata;
import com.aiassistant.dto.response.ApiResponse;
import com.aiassistant.service.model.ModelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/models")
@Tag(name = "Models", description = "LLM management, downloading, and benchmarking")
@RequiredArgsConstructor
public class ModelController {

    private final ModelService modelService;

    @Operation(summary = "Model Catalog", description = "Get all available models for download from HuggingFace")
    @GetMapping(value = "/catalog", produces = "application/json")
    @ResponseBody
    public String catalog() {
        return modelService.getCatalog();
    }

    @Operation(summary = "List Models", description = "Get installed models and their status")
    @GetMapping("/list")
    public ApiResponse<List<ModelMetadata>> listModels() {
        return ApiResponse.success(modelService.listModels());
    }

    @Operation(summary = "Download Model", description = "Trigger async download of a GGUF model by catalog ID")
    @PostMapping("/download/{modelId}")
    public String downloadModelById(@PathVariable String modelId) {
        return modelService.downloadModel(modelId);
    }

    @Operation(summary = "Download Status", description = "Get download progress for a model")
    @GetMapping(value = "/download/status/{modelId}", produces = "application/json")
    @ResponseBody
    public String downloadStatus(@PathVariable String modelId) {
        return modelService.getDownloadStatus(modelId);
    }

    @Operation(summary = "Cancel Download", description = "Cancel an active model download")
    @PostMapping(value = "/download/cancel/{modelId}", produces = "application/json")
    @ResponseBody
    public String cancelDownload(@PathVariable String modelId) {
        return modelService.cancelDownload(modelId);
    }

    @Operation(summary = "Download Model (Legacy)", description = "Trigger download by model name")
    @PostMapping("/download")
    public ApiResponse<Void> downloadModel(@RequestBody DownloadModelRequest request) {
        modelService.downloadModel(request);
        return ApiResponse.success(null);
    }

    @Operation(summary = "Delete Model", description = "Delete a local model file")
    @DeleteMapping("/delete/{modelId}")
    public ApiResponse<Void> deleteModel(@PathVariable String modelId) {
        modelService.deleteModel(modelId);
        return ApiResponse.success(null);
    }

    @Operation(summary = "Benchmark Model", description = "Run a performance benchmark (tokens/sec)")
    @PostMapping("/benchmark/{modelName}")
    public ApiResponse<Void> benchmarkModel(@PathVariable String modelName) {
        modelService.runBenchmark(modelName);
        return ApiResponse.success(null);
    }

    @Operation(summary = "Recommend Model", description = "Get model recommendations based on hardware stats")
    @GetMapping("/recommend")
    public ApiResponse<List<String>> recommendModels() {
        return ApiResponse.success(modelService.recommendModels());
    }
}
