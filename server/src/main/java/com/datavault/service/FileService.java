package com.datavault.service;

import com.datavault.dto.FileResponse;
import com.datavault.dto.MessageResponse;
import com.datavault.entity.FileEntity;
import com.datavault.entity.FileShare;
import com.datavault.entity.FileVersion;
import com.datavault.entity.User;
import com.datavault.repository.FileRepository;
import com.datavault.repository.FileShareRepository;
import com.datavault.repository.FileVersionRepository;
import com.datavault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FileService {

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileVersionRepository fileVersionRepository;

    @Autowired
    private FileShareRepository fileShareRepository;

    private String calculateSHA256(MultipartFile file) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(file.getBytes());
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private String calculateSHA256(InputStream is) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = is.read(buffer)) != -1) {
                digest.update(buffer, 0, bytesRead);
            }
            byte[] hashBytes = digest.digest();
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    public FileResponse uploadFile(MultipartFile file, String email) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long currentStorage = fileRepository.getStorageUsedByUser(user);
        if (currentStorage + file.getSize() > user.getStorageLimit()) {
            throw new RuntimeException("Storage limit exceeded. Please free up space.");
        }

        String sha256Hash = calculateSHA256(file);

        // Check for duplicate - reject if same user has same file content
        FileEntity existingFile = fileRepository.findByUserAndSha256HashAndIsDeletedFalse(user, sha256Hash).orElse(null);
        if (existingFile != null) {
            throw new RuntimeException("Duplicate file not allowed. You have already uploaded this file.");
        }

        // No duplicate - store new file
        String userDir = uploadDir + "/" + user.getId();
        Path userPath = Paths.get(userDir);
        if (!Files.exists(userPath)) {
            Files.createDirectories(userPath);
        }

        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String storedFileName = UUID.randomUUID().toString() + extension;

        Path targetLocation = userPath.resolve(storedFileName);
        // Also write file and calculate hash from stream to verify
        try (InputStream is = file.getInputStream()) {
            Files.copy(is, targetLocation, StandardCopyOption.REPLACE_EXISTING);
        }

        FileEntity fileEntity = new FileEntity();
        fileEntity.setOriginalFileName(originalFileName);
        fileEntity.setStoredFileName(storedFileName);
        fileEntity.setFileType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        fileEntity.setFileSize(file.getSize());
        fileEntity.setFilePath(targetLocation.toString());
        fileEntity.setSha256Hash(sha256Hash);
        fileEntity.setUser(user);

        fileEntity = fileRepository.save(fileEntity);

        // Save version
        FileVersion version = new FileVersion();
        version.setOriginalFileName(originalFileName);
        version.setStoredFileName(storedFileName);
        version.setFileType(fileEntity.getFileType());
        version.setFileSize(file.getSize());
        version.setFilePath(targetLocation.toString());
        version.setSha256Hash(sha256Hash);
        version.setFile(fileEntity);
        version.setUser(user);
        version.setChangeType("CREATE");
        fileVersionRepository.save(version);

        user.setStorageUsed(currentStorage + file.getSize());
        userRepository.save(user);

        return mapToFileResponse(fileEntity);
    }

    public List<FileResponse> getUserFiles(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return fileRepository.findByUserAndIsDeletedFalseOrderByCreatedAtDesc(user)
                .stream().map(this::mapToFileResponse).collect(Collectors.toList());
    }

    public List<FileResponse> getFavoriteFiles(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return fileRepository.findByUserAndIsDeletedFalseAndIsFavoriteTrueOrderByCreatedAtDesc(user)
                .stream().map(this::mapToFileResponse).collect(Collectors.toList());
    }

    public List<FileResponse> getTrashFiles(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return fileRepository.findByUserAndIsDeletedTrueOrderByDeletedAtDesc(user)
                .stream().map(this::mapToFileResponse).collect(Collectors.toList());
    }

    public List<FileResponse> searchFiles(String email, String query) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return fileRepository.searchByUser(user, query)
                .stream().map(this::mapToFileResponse).collect(Collectors.toList());
    }

    public List<FileResponse> getFilesByType(String email, String type) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String lowered = type == null ? "" : type.toLowerCase();
        return fileRepository.findByUserAndIsDeletedFalseOrderByCreatedAtDesc(user)
                .stream()
                .filter(f -> f.getFileType() != null && f.getFileType().toLowerCase().contains(lowered))
                .map(this::mapToFileResponse)
                .collect(Collectors.toList());
    }

    public FileResponse renameFile(String email, Long fileId, String newName) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FileEntity fileEntity = fileRepository.findByIdAndUserAndIsDeletedFalse(fileId, user)
                .orElseThrow(() -> new RuntimeException("File not found"));

        fileEntity.setOriginalFileName(newName);
        fileEntity = fileRepository.save(fileEntity);

        return mapToFileResponse(fileEntity);
    }

    public FileResponse toggleFavorite(Long fileId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FileEntity fileEntity = fileRepository.findByIdAndUserAndIsDeletedFalse(fileId, user)
                .orElseThrow(() -> new RuntimeException("File not found"));

        fileEntity.setFavorite(!fileEntity.isFavorite());
        fileEntity = fileRepository.save(fileEntity);

        return mapToFileResponse(fileEntity);
    }

    @Transactional
    public MessageResponse deleteFile(Long fileId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FileEntity fileEntity = fileRepository.findByIdAndUserAndIsDeletedFalse(fileId, user)
                .orElseThrow(() -> new RuntimeException("File not found"));

        // Check if any other active files reference this same physical file
        long refCount = fileRepository.findByUserAndSha256HashAndIsDeletedFalse(user, fileEntity.getSha256Hash())
                .stream()
                .filter(f -> !f.getId().equals(fileId))
                .count();

        fileEntity.setDeleted(true);
        fileEntity.setDeletedAt(LocalDateTime.now());
        fileRepository.save(fileEntity);

        fileShareRepository.deleteByFile(fileEntity);

        return new MessageResponse("File moved to trash");
    }

    @Transactional
    public MessageResponse permanentlyDeleteFile(Long fileId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FileEntity fileEntity = fileRepository.findByIdAndUser(fileId, user)
                .orElseThrow(() -> new RuntimeException("File not found"));

        try {
            // Check if any other active files use this same physical file (same hash and path)
            boolean otherRefs = fileRepository.findByUserAndSha256HashAndIsDeletedFalse(user, fileEntity.getSha256Hash())
                    .stream()
                    .anyMatch(f -> !f.getId().equals(fileId));

            if (!otherRefs) {
                Path filePath = Paths.get(fileEntity.getFilePath());
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
        }

        user.setStorageUsed(Math.max(0, user.getStorageUsed() - fileEntity.getFileSize()));
        userRepository.save(user);

        fileShareRepository.deleteByFile(fileEntity);
        fileVersionRepository.deleteByFile(fileEntity);
        fileRepository.delete(fileEntity);

        return new MessageResponse("File permanently deleted");
    }

    @Transactional
    public MessageResponse restoreFile(Long fileId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FileEntity fileEntity = fileRepository.findByIdAndUser(fileId, user)
                .orElseThrow(() -> new RuntimeException("File not found"));

        fileEntity.setDeleted(false);
        fileEntity.setDeletedAt(null);
        fileRepository.save(fileEntity);

        return new MessageResponse("File restored from trash");
    }

    public Path getFilePath(Long fileId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FileEntity fileEntity = fileRepository.findByIdAndUserAndIsDeletedFalse(fileId, user)
                .orElseThrow(() -> new RuntimeException("File not found"));

        return Paths.get(fileEntity.getFilePath());
    }

    public String getOriginalFileName(Long fileId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FileEntity fileEntity = fileRepository.findByIdAndUserAndIsDeletedFalse(fileId, user)
                .orElseThrow(() -> new RuntimeException("File not found"));

        return fileEntity.getOriginalFileName();
    }

    public List<FileResponse> getFileVersions(Long fileId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FileEntity fileEntity = fileRepository.findByIdAndUser(fileId, user)
                .orElseThrow(() -> new RuntimeException("File not found"));

        return fileVersionRepository.findByFileOrderByCreatedAtDesc(fileEntity)
                .stream().map(this::mapVersionToResponse).collect(Collectors.toList());
    }

    private FileResponse mapVersionToResponse(FileVersion version) {
        FileResponse resp = new FileResponse();
        resp.setId(version.getId());
        resp.setOriginalFileName(version.getOriginalFileName());
        resp.setFileType(version.getFileType());
        resp.setFileSize(version.getFileSize());
        resp.setFavorite(false);
        resp.setFolder(version.getFile() != null ? version.getFile().getFolder() : "root");
        resp.setCreatedAt(version.getCreatedAt());
        resp.setUpdatedAt(version.getCreatedAt());
        return resp;
    }

    private FileResponse mapToFileResponse(FileEntity fileEntity) {
        FileResponse resp = new FileResponse();
        resp.setId(fileEntity.getId());
        resp.setOriginalFileName(fileEntity.getOriginalFileName());
        resp.setFileType(fileEntity.getFileType());
        resp.setFileSize(fileEntity.getFileSize());
        resp.setFavorite(fileEntity.isFavorite());
        resp.setFolder(fileEntity.getFolder());
        resp.setCreatedAt(fileEntity.getCreatedAt());
        resp.setUpdatedAt(fileEntity.getUpdatedAt());
        return resp;
    }
}