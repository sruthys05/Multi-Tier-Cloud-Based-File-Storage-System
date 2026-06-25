package com.datavault.dto;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private Long storageUsed;
    private Long storageLimit;
    private String theme;
    private String role;
    private boolean emailVerified;
    private String verificationLink;

    public JwtResponse() {}

    public JwtResponse(String token, String type, Long id, String email, String fullName,
                       String avatarUrl, Long storageUsed, Long storageLimit, String theme, String role,
                       boolean emailVerified, String verificationLink) {
        this.token = token;
        this.type = type;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.storageUsed = storageUsed;
        this.storageLimit = storageLimit;
        this.theme = theme;
        this.role = role;
        this.emailVerified = emailVerified;
        this.verificationLink = verificationLink;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public Long getStorageUsed() { return storageUsed; }
    public void setStorageUsed(Long storageUsed) { this.storageUsed = storageUsed; }
    public Long getStorageLimit() { return storageLimit; }
    public void setStorageLimit(Long storageLimit) { this.storageLimit = storageLimit; }
    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
    public String getVerificationLink() { return verificationLink; }
    public void setVerificationLink(String verificationLink) { this.verificationLink = verificationLink; }
}
