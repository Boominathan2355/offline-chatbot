package com.aiassistant.controller.image;

import com.aiassistant.dto.request.ImageGenerationRequest;
import com.aiassistant.service.image.ImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/images")
@Tag(name = "Images", description = "Image generation and model management")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    @Operation(summary = "Image Model Catalog", description = "Get available image models")
    @GetMapping(value = "/catalog", produces = "application/json")
    @ResponseBody
    public String catalog() {
        return imageService.getCatalog();
    }

    @Operation(summary = "Generate Image", description = "Generate an image using a local model")
    @PostMapping(value = "/generate", produces = "application/json")
    @ResponseBody
    public String generate(@RequestBody ImageGenerationRequest request) {
        return imageService.generateImage(request);
    }

    @Operation(summary = "Download Model", description = "Download a model")
    @PostMapping(value = "/download", produces = "application/json")
    @ResponseBody
    public String download(@RequestBody Map<String, String> body) {
        return imageService.downloadModel(body.get("model_id"));
    }

    @Operation(summary = "Download Status", description = "Check download status")
    @GetMapping(value = "/download/{modelId}", produces = "application/json")
    @ResponseBody
    public String downloadStatus(@PathVariable String modelId) {
        return imageService.getDownloadStatus(modelId);
    }

    @Operation(summary = "Delete Model", description = "Delete a downloaded model")
    @DeleteMapping(value = "/delete/{modelId}", produces = "application/json")
    @ResponseBody
    public String delete(@PathVariable String modelId) {
        return imageService.deleteModel(modelId);
    }
}
