package com.datavault.dto;

import java.time.LocalDateTime;

public class FileResponse {
    private Long id;
    private String originalFileName;
    private String fileType;
    private Long fileSize;
    private boolean isFavorite;
    private String folder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FileResponse() {}

    public FileResponse(Long id, String originalFileName, String fileType, Long fileSize,
                        boolean isFavorite, String folder, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.originalFileName = originalFileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.isFavorite = isFavorite;
        this.folder = folder;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public boolean isFavorite() { return isFavorite; }
    public void setFavorite(boolean favorite) { isFavorite = favorite; }
    public String getFolder() { return folder; }
    public void setFolder(String folder) { this.folder = folder; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}