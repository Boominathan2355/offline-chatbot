package com.aiassistant.controller.download;

import com.aiassistant.service.download.DownloadManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/models")
@RequiredArgsConstructor
public class ModelDownloadController {

    private final DownloadManagerService downloadService;

    @PostMapping("/download/{id}")
    public ResponseEntity<String> download(@PathVariable String id, @RequestParam String url) {
        downloadService.downloadModel(id, url);
        return ResponseEntity.ok("Download started in background");
    }
}
