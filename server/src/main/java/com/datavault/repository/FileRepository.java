package com.datavault.repository;

import com.datavault.entity.FileEntity;
import com.datavault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    List<FileEntity> findByUserAndIsDeletedFalseOrderByCreatedAtDesc(User user);
    List<FileEntity> findByUserAndIsDeletedFalseAndIsFavoriteTrueOrderByCreatedAtDesc(User user);
    List<FileEntity> findByUserAndIsDeletedTrueOrderByDeletedAtDesc(User user);
    Optional<FileEntity> findByIdAndUserAndIsDeletedFalse(Long id, User user);
    Optional<FileEntity> findByIdAndUser(Long id, User user);
    Optional<FileEntity> findByUserAndSha256HashAndIsDeletedFalse(User user, String sha256Hash);

    @Query("SELECT f FROM FileEntity f WHERE f.user = :user AND f.isDeleted = false AND LOWER(f.originalFileName) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY f.createdAt DESC")
    List<FileEntity> searchByUser(@Param("user") User user, @Param("query") String query);

    @Query("SELECT COALESCE(SUM(f.fileSize), 0) FROM FileEntity f WHERE f.user = :user AND f.isDeleted = false")
    Long getStorageUsedByUser(@Param("user") User user);
}