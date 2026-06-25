package com.datavault.security;

import com.datavault.dto.JwtResponse;
import com.datavault.entity.User;
import com.datavault.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setPassword("oauth2");
            newUser.setFullName(name != null ? name : email.split("@")[0]);
            newUser.setEmailVerified(true);
            newUser.setProvider("google");
            newUser.setProviderId(oAuth2User.getAttribute("sub"));
            return userRepository.save(newUser);
        });

        String token = jwtUtils.generateJwtToken(user.getEmail());

        JwtResponse jwtResponse = new JwtResponse();
        jwtResponse.setToken(token);
        jwtResponse.setType("Bearer");
        jwtResponse.setId(user.getId());
        jwtResponse.setEmail(user.getEmail());
        jwtResponse.setFullName(user.getFullName());
        jwtResponse.setAvatarUrl(user.getAvatarUrl());
        jwtResponse.setStorageUsed(user.getStorageUsed());
        jwtResponse.setStorageLimit(user.getStorageLimit());
        jwtResponse.setTheme(user.getTheme());

        response.setContentType("application/json");
        response.getWriter().write(objectMapper.writeValueAsString(jwtResponse));
        response.getWriter().flush();
    }
}