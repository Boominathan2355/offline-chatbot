package com.aiassistant.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdatePermissionRequest {
    private String toolName;
    private String permissionStatus;
}
