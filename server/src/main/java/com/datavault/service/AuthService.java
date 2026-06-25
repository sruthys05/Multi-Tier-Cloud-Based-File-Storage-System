package com.datavault.service;

import com.datavault.dto.*;
import com.datavault.entity.User;
import com.datavault.repository.UserRepository;
import com.datavault.security.JwtUtils;
import com.datavault.security.UserDetailsImpl;
import com.datavault.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    public JwtResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProvider("local");

        user = userRepository.save(user);
        String token = jwtUtils.generateJwtToken(user.getEmail());

        JwtResponse resp = new JwtResponse();
        resp.setToken(token);
        resp.setType("Bearer");
        resp.setId(user.getId());
        resp.setEmail(user.getEmail());
        resp.setFullName(user.getFullName());
        resp.setAvatarUrl(user.getAvatarUrl());
        resp.setStorageUsed(user.getStorageUsed());
        resp.setStorageLimit(user.getStorageLimit());
        resp.setTheme(user.getTheme());
        resp.setRole(user.getRole());
        resp.setEmailVerified(user.isEmailVerified());
        return resp;
    }

    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String token = jwtUtils.generateJwtToken(userDetails.getEmail());

        try {
            emailService.sendLoginSuccessEmail(userDetails.getEmail());
        } catch (Exception e) {
            // ignore mail errors to not break login
        }

        JwtResponse resp = new JwtResponse();
        resp.setToken(token);
        resp.setType("Bearer");
        resp.setId(userDetails.getId());
        resp.setEmail(userDetails.getEmail());
        resp.setFullName(userDetails.getFullName());
        resp.setAvatarUrl(userDetails.getAvatarUrl());
        resp.setStorageUsed(userDetails.getStorageUsed());
        resp.setStorageLimit(userDetails.getStorageLimit());
        resp.setTheme(userDetails.getTheme());
        resp.setRole(userDetails.getRole());
        resp.setEmailVerified(userDetails.isEmailVerified());
        return resp;
    }

    public JwtResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        JwtResponse resp = new JwtResponse();
        resp.setId(user.getId());
        resp.setEmail(user.getEmail());
        resp.setFullName(user.getFullName());
        resp.setAvatarUrl(user.getAvatarUrl());
        resp.setStorageUsed(user.getStorageUsed());
        resp.setStorageLimit(user.getStorageLimit());
        resp.setTheme(user.getTheme());
        resp.setRole(user.getRole());
        resp.setEmailVerified(user.isEmailVerified());
        return resp;
    }

    public JwtResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        user = userRepository.save(user);

        JwtResponse resp = new JwtResponse();
        resp.setId(user.getId());
        resp.setEmail(user.getEmail());
        resp.setFullName(user.getFullName());
        resp.setAvatarUrl(user.getAvatarUrl());
        resp.setStorageUsed(user.getStorageUsed());
        resp.setStorageLimit(user.getStorageLimit());
        resp.setTheme(user.getTheme());
        resp.setRole(user.getRole());
        return resp;
    }

    public MessageResponse updatePassword(String email, UpdatePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new MessageResponse("Password updated successfully");
    }

    public MessageResponse updateTheme(String email, ThemeRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setTheme(request.getTheme());
        userRepository.save(user);

        return new MessageResponse("Theme updated successfully");
    }
}