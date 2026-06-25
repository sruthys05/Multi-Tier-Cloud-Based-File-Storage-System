package com.datavault.controller;

import com.datavault.dto.*;
import com.datavault.security.UserDetailsImpl;
import com.datavault.service.AuthService;
import com.datavault.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@Valid @RequestBody RegisterRequest request) {
        JwtResponse response = authService.register(request);
        if (!response.isEmailVerified()) {
            String verifyLink = emailService.createVerificationToken(response.getEmail());
            response.setVerificationLink(verifyLink);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse response = authService.login(request);
        // Do not send verification email on login; only on registration or explicit resend
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<JwtResponse> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(authService.getCurrentUser(userDetails.getEmail()));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@RequestParam String token) {
        boolean success = emailService.verifyToken(token);
        if (success) {
            return ResponseEntity.ok(new MessageResponse("Email verified successfully"));
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired verification link"));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<JwtResponse> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(userDetails.getEmail(), request));
    }

    @PutMapping("/password")
    public ResponseEntity<MessageResponse> updatePassword(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UpdatePasswordRequest request) {
        return ResponseEntity.ok(authService.updatePassword(userDetails.getEmail(), request));
    }

    @PutMapping("/theme")
    public ResponseEntity<MessageResponse> updateTheme(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ThemeRequest request) {
        return ResponseEntity.ok(authService.updateTheme(userDetails.getEmail(), request));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        String link = emailService.createVerificationToken(userDetails.getEmail());
        return ResponseEntity.ok(new java.util.HashMap<String, String>() {{ put("verificationLink", link); }});
    }
}
