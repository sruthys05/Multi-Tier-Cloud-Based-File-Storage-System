package com.datavault.repository;

import com.datavault.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findByEmailAndExpiresAtAfter(String email, java.time.LocalDateTime now);
    Optional<EmailVerification> findByTokenAndExpiresAtAfter(String token, java.time.LocalDateTime now);
}