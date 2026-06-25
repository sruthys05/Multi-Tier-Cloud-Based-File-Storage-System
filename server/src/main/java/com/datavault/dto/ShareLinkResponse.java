package com.datavault.dto;

import java.time.LocalDateTime;

public class ShareLinkResponse {
    private Long id;
    private String shareLink;
    private String permission;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    public ShareLinkResponse() {}

    public ShareLinkResponse(Long id, String shareLink, String permission, LocalDateTime expiresAt, LocalDateTime createdAt) {
        this.id = id;
        this.shareLink = shareLink;
        this.permission = permission;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getShareLink() { return shareLink; }
    public void setShareLink(String shareLink) { this.shareLink = shareLink; }
    public String getPermission() { return permission; }
    public void setPermission(String permission) { this.permission = permission; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}