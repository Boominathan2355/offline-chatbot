package com.aiassistant.controller.auth;

import com.aiassistant.dto.request.LoginRequest;
import com.aiassistant.dto.request.RegisterRequest;
import com.aiassistant.dto.response.LoginResponse;
import com.aiassistant.dto.response.ApiResponse;
import com.aiassistant.dto.request.RefreshTokenRequest;
import com.aiassistant.service.auth.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Login and session management endpoints")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Operation(summary = "Login", description = "Authenticate user and return JWT tokens")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully authenticated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping("/login")
    public com.aiassistant.dto.response.ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        return com.aiassistant.dto.response.ApiResponse.success(authService.login(request));
    }

    @Operation(summary = "Register", description = "Register a new user (admin only in prod)")
    @PostMapping("/register")
    public com.aiassistant.dto.response.ApiResponse<Void> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return com.aiassistant.dto.response.ApiResponse.success(null);
    }

    @Operation(summary = "Refresh Token", description = "Get new access token using refresh token")
    @PostMapping("/refresh")
    public com.aiassistant.dto.response.ApiResponse<LoginResponse> refresh(@RequestBody RefreshTokenRequest request) {
        return com.aiassistant.dto.response.ApiResponse.success(authService.refresh(request));
    }

    @Operation(summary = "Logout", description = "Invalidate current session")
    @PostMapping("/logout")
    public com.aiassistant.dto.response.ApiResponse<Void> logout(@RequestHeader("Authorization") String token) {
        authService.logout(token);
        return com.aiassistant.dto.response.ApiResponse.success(null);
    }
}
