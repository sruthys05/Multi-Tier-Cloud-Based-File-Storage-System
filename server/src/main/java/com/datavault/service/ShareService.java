package com.datavault.service;

import com.datavault.dto.ShareLinkResponse;
import com.datavault.entity.FileEntity;
import com.datavault.entity.FileShare;
import com.datavault.entity.User;
import com.datavault.repository.FileRepository;
import com.datavault.repository.FileShareRepository;
import com.datavault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ShareService {

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private FileShareRepository fileShareRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${server.servlet.context-path:/api}")
    private String contextPath;

    public ShareLinkResponse generateShareLink(Long fileId, String email, String permission, Integer expiryHours) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FileEntity fileEntity = fileRepository.findByIdAndUserAndIsDeletedFalse(fileId, user)
                .orElseThrow(() -> new RuntimeException("File not found"));

        String shareToken = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");

        FileShare fileShare = new FileShare();
        fileShare.setShareToken(shareToken);
        fileShare.setFile(fileEntity);
        fileShare.setSharedBy(user);
        fileShare.setPermission(permission.toUpperCase());
        fileShare.setExpiresAt(LocalDateTime.now().plusHours(expiryHours));
        fileShare.setActive(true);

        fileShare = fileShareRepository.save(fileShare);

        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        String shareLink = baseUrl + "/public/s/" + shareToken;

        return new ShareLinkResponse(
                fileShare.getId(),
                shareLink,
                fileShare.getPermission(),
                fileShare.getExpiresAt(),
                fileShare.getCreatedAt()
        );
    }

    public List<ShareLinkResponse> getFileShares(Long fileId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FileEntity fileEntity = fileRepository.findByIdAndUserAndIsDeletedFalse(fileId, user)
                .orElseThrow(() -> new RuntimeException("File not found"));

        return fileShareRepository.findByFileAndIsActiveTrue(fileEntity)
                .stream()
                .map(share -> new ShareLinkResponse(
                        share.getId(),
                        null,
                        share.getPermission(),
                        share.getExpiresAt(),
                        share.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    public void revokeShare(Long shareId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FileShare share = fileShareRepository.findById(shareId)
                .orElseThrow(() -> new RuntimeException("Share not found"));

        if (!share.getSharedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to revoke this share");
        }

        share.setActive(false);
        fileShareRepository.save(share);
    }

    public FileShare resolveShareToken(String shareToken) {
        FileShare share = fileShareRepository.findByShareTokenAndIsActiveTrue(shareToken)
                .orElseThrow(() -> new RuntimeException("Share link not found or expired"));

        if (share.getExpiresAt().isBefore(LocalDateTime.now())) {
            share.setActive(false);
            fileShareRepository.save(share);
            throw new RuntimeException("Share link has expired");
        }

        return share;
    }
}