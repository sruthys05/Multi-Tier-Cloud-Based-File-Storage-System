package com.datavault.service;

import com.datavault.entity.EmailVerification;
import com.datavault.entity.User;
import com.datavault.repository.EmailVerificationRepository;
import com.datavault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class EmailService {

    @Autowired
    private EmailVerificationRepository emailVerificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.formspree.endpoint:}")
    private String formspreeEndpoint;

    private void sendViaFormspree(String toEmail, String subject, String message) {
        if (formspreeEndpoint == null || formspreeEndpoint.isBlank()) {
            return;
        }
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> body = new HashMap<>();
            body.put("email", toEmail);
            body.put("subject", subject);
            body.put("message", message);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(formspreeEndpoint, request, String.class);
        } catch (Exception e) {
            // ignore notification errors
        }
    }

    public String createVerificationToken(String email) {
        // Remove any existing tokens for this email
        emailVerificationRepository.findByEmailAndExpiresAtAfter(email, LocalDateTime.now())
                .ifPresent(ev -> emailVerificationRepository.delete(ev));

        String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");

        EmailVerification ev = new EmailVerification();
        ev.setEmail(email);
        ev.setToken(token);
        ev.setExpiresAt(LocalDateTime.now().plusHours(24));

        emailVerificationRepository.save(ev);

        String verifyLink = "http://localhost:3000/verify-email?token=" + token;
        String message = "Please verify your email by clicking the link:\n" + verifyLink + "\n\nIf you did not request this, you can ignore it.";
        sendViaFormspree(email, "Verify your DataVault account", message);
        return verifyLink;
    }

    public void sendLoginSuccessEmail(String toEmail) {
        String message = "You have successfully logged in to DataVault.";
        sendViaFormspree(toEmail, "Login Successful - DataVault", message);
    }

    public boolean verifyToken(String token) {
        EmailVerification ev = emailVerificationRepository.findByTokenAndExpiresAtAfter(token, LocalDateTime.now())
                .orElse(null);

        if (ev == null) {
            return false;
        }

        User user = userRepository.findByEmail(ev.getEmail()).orElse(null);
        if (user == null) {
            return false;
        }

        user.setEmailVerified(true);
        userRepository.save(user);

        emailVerificationRepository.delete(ev);
        return true;
    }
}