package com.aiassistant.service.download;

import com.aiassistant.entity.ModelMetadata;
import com.aiassistant.service.model.ModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@EnableAsync
public class DownloadManagerService {

    private final ModelService modelService;

    @Async
    public void downloadModel(String modelId, String url) {
        // Find model and set status to DOWNLOADING
        ModelMetadata model = modelService.getAllModels().stream()
                .filter(m -> m.getId().equals(modelId))
                .findFirst()
                .orElseThrow();
        
        model.setStatus("DOWNLOADING");
        modelService.saveModel(model);

        // TODO: Implement actual download logic using RestTemplate or WebClient
        // For now, simulate download
        try {
            Thread.sleep(5000);
            model.setStatus("DOWNLOADED");
            model.setDownloadPath("./models/" + model.getName());
            modelService.saveModel(model);
        } catch (InterruptedException e) {
            model.setStatus("ERROR");
            modelService.saveModel(model);
        }
    }
}
