package com.aiassistant.service.auth;

import com.aiassistant.dto.request.LoginRequest;
import com.aiassistant.dto.request.RegisterRequest;
import com.aiassistant.dto.response.LoginResponse;
import com.aiassistant.entity.User;
import com.aiassistant.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"));
        
        // Convert entity to UserDetails for JwtService
        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPasswordHash(),
                new ArrayList<>()
        );

        var accessToken = jwtService.generateToken(userDetails);
        var refreshToken = jwtService.generateToken(new java.util.HashMap<>(), userDetails); // Simply reuse for now or implement refresh expiry

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public void register(RegisterRequest request) {
        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();
        userRepository.save(user);
    }

    public LoginResponse refresh(com.aiassistant.dto.request.RefreshTokenRequest request) {
        String username = jwtService.extractUsername(request.getRefreshToken());
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"));
        
        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPasswordHash(),
                new ArrayList<>()
        );

        if (jwtService.isTokenValid(request.getRefreshToken(), userDetails)) {
            var accessToken = jwtService.generateToken(userDetails);
            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(request.getRefreshToken())
                    .build();
        }
        throw new RuntimeException("Invalid refresh token");
    }

    public void logout(String token) {
        // Placeholder for token blacklisting if needed
        System.out.println("User logged out with token: " + token);
    }
}
