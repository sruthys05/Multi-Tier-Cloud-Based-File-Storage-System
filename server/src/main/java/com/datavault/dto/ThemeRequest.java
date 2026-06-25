package com.datavault.dto;

import jakarta.validation.constraints.NotBlank;

public class ThemeRequest {
    @NotBlank(message = "Theme is required")
    private String theme;

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
}