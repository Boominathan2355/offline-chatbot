package com.aiassistant.dto.response;

import java.time.LocalDateTime;

public class ApiResponse<T> {
    private String status; // "success" or "error"
    private T data;
    private String message;
    private LocalDateTime timestamp;
    private String errorCode;

    public ApiResponse() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setStatus("success");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return response;
    }

    public static <T> ApiResponse<T> error(String message, String errorCode) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setStatus("error");
        response.setMessage(message);
        response.setErrorCode(errorCode);
        response.setTimestamp(LocalDateTime.now());
        return response;
    }
}
