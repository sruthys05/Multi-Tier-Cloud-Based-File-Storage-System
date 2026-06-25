package com.datavault.repository;

import com.datavault.entity.FileEntity;
import com.datavault.entity.FileShare;
import com.datavault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileShareRepository extends JpaRepository<FileShare, Long> {
    Optional<FileShare> findByShareTokenAndIsActiveTrue(String shareToken);
    List<FileShare> findByFileAndIsActiveTrue(FileEntity file);
    List<FileShare> findBySharedByAndIsActiveTrue(User sharedBy);
    void deleteByFile(FileEntity file);
}