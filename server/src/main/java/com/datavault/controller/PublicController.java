package com.datavault.controller;

import com.datavault.dto.ShareRequest;
import com.datavault.entity.FileShare;
import com.datavault.entity.User;
import com.datavault.repository.FileShareRepository;
import com.datavault.repository.UserRepository;
import com.datavault.service.ShareService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/public")
public class PublicController {

    @Autowired
    private ShareService shareService;

    @Autowired
    private FileShareRepository fileShareRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/s/{shareToken}")
    public ResponseEntity<?> accessSharedFile(
            @PathVariable String shareToken,
            Principal principal) throws IOException {
        // Validate share token
        FileShare share = shareService.resolveShareToken(shareToken);

        Path filePath = Paths.get(share.getFile().getFilePath());
        String originalFileName = share.getFile().getOriginalFileName();

        // If owner/authenticated user requests via public link, may allow direct download
        Resource resource = new PathResource(filePath);
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = "application/octet-stream";
        if ("VIEW".equalsIgnoreCase(share.getPermission())) {
            // Inline view
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(share.getFile().getFileType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + originalFileName + "\"")
                    .body(resource);
        } else {
            // Download
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + originalFileName + "\"")
                    .body(resource);
        }
    }

    @GetMapping("/s/{shareToken}/info")
    public ResponseEntity<?> getSharedFileInfo(@PathVariable String shareToken) {
        // Validate token
        FileShare share = shareService.resolveShareToken(shareToken);

        // Return minimal info like name, type, expiry
        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
            put("fileName", share.getFile().getOriginalFileName());
            put("fileType", share.getFile().getFileType());
            put("fileSize", share.getFile().getFileSize());
            put("permission", share.getPermission());
            put("expiresAt", share.getExpiresAt());
        }});
    }
}