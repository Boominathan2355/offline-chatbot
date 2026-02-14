package com.aiassistant.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "plugins")
public class Plugin {
    @Id
    private String id;
    private String name;
    private String version;
    private String description;
    private List<String> permissions;
    private boolean enabled;
    private java.time.LocalDateTime registeredAt;
}
