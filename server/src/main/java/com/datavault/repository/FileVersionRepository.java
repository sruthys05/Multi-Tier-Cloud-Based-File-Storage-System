package com.datavault.repository;

import com.datavault.entity.FileEntity;
import com.datavault.entity.FileVersion;
import com.datavault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileVersionRepository extends JpaRepository<FileVersion, Long> {
    List<FileVersion> findByFileOrderByCreatedAtDesc(FileEntity file);
    List<FileVersion> findByUserOrderByCreatedAtDesc(User user);
    List<FileVersion> findByFileAndSha256Hash(FileEntity file, String sha256Hash);
    void deleteByFile(FileEntity file);
}
