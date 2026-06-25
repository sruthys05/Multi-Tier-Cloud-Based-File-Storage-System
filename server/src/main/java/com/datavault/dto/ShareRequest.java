package com.datavault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class ShareRequest {
    @NotBlank(message = "Permission is required")
    private String permission; // VIEW or DOWNLOAD

    @NotNull(message = "Expiry hours is required")
    @Positive(message = "Expiry hours must be positive")
    private Integer expiryHours;

    public ShareRequest() {}

    public ShareRequest(String permission, Integer expiryHours) {
        this.permission = permission;
        this.expiryHours = expiryHours;
    }

    public String getPermission() { return permission; }
    public void setPermission(String permission) { this.permission = permission; }
    public Integer getExpiryHours() { return expiryHours; }
    public void setExpiryHours(Integer expiryHours) { this.expiryHours = expiryHours; }
}