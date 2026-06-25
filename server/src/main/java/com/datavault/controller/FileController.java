package com.datavault.controller;

import com.datavault.dto.FileResponse;
import com.datavault.dto.MessageResponse;
import com.datavault.dto.ShareLinkResponse;
import com.datavault.dto.ShareRequest;
import com.datavault.security.UserDetailsImpl;
import com.datavault.service.FileService;
import com.datavault.service.ShareService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/files")
public class FileController {

    @Autowired
    private FileService fileService;

    @Autowired
    private ShareService shareService;

    @PostMapping("/upload")
    public ResponseEntity<FileResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetailsImpl userDetails) throws IOException {
        return ResponseEntity.ok(fileService.uploadFile(file, userDetails.getEmail()));
    }

    @GetMapping
    public ResponseEntity<List<FileResponse>> getUserFiles(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(fileService.getUserFiles(userDetails.getEmail()));
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<FileResponse>> getFavoriteFiles(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(fileService.getFavoriteFiles(userDetails.getEmail()));
    }

    @GetMapping("/trash")
    public ResponseEntity<List<FileResponse>> getTrashFiles(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(fileService.getTrashFiles(userDetails.getEmail()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<FileResponse>> searchFiles(
            @RequestParam("query") String query,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(fileService.searchFiles(userDetails.getEmail(), query));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<FileResponse>> filterFiles(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "desc") String sort,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        // For now, sorting is applied in frontend; backend returns filtered by type
        return ResponseEntity.ok(fileService.getFilesByType(userDetails.getEmail(), type));
    }

    @PutMapping("/{id}/rename")
    public ResponseEntity<FileResponse> renameFile(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String newName = request.get("name");
        if (newName == null || newName.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(fileService.renameFile(userDetails.getEmail(), id, newName));
    }

    @PutMapping("/{id}/favorite")
    public ResponseEntity<FileResponse> toggleFavorite(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(fileService.toggleFavorite(id, userDetails.getEmail()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteFile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(fileService.deleteFile(id, userDetails.getEmail()));
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<MessageResponse> permanentlyDeleteFile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(fileService.permanentlyDeleteFile(id, userDetails.getEmail()));
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<MessageResponse> restoreFile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(fileService.restoreFile(id, userDetails.getEmail()));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) throws IOException {
        Path filePath = fileService.getFilePath(id, userDetails.getEmail());
        String originalFileName = fileService.getOriginalFileName(id, userDetails.getEmail());

        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = "application/octet-stream";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + originalFileName + "\"")
                .body(resource);
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<FileResponse>> getFileVersions(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(fileService.getFileVersions(id, userDetails.getEmail()));
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<ShareLinkResponse> generateShareLink(
            @PathVariable Long id,
            @Valid @RequestBody ShareRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        ShareLinkResponse response = shareService.generateShareLink(
                id, userDetails.getEmail(), request.getPermission(), request.getExpiryHours()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/shares")
    public ResponseEntity<List<ShareLinkResponse>> getFileShares(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(shareService.getFileShares(id, userDetails.getEmail()));
    }

    @DeleteMapping("/shares/{shareId}")
    public ResponseEntity<MessageResponse> revokeShare(
            @PathVariable Long shareId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        shareService.revokeShare(shareId, userDetails.getEmail());
        return ResponseEntity.ok(new MessageResponse("Share link revoked successfully"));
    }
}