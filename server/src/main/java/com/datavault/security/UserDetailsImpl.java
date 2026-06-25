package com.datavault.security;

import com.datavault.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String email;
    private String password;
    private String fullName;
    private String avatarUrl;
    private Long storageUsed;
    private Long storageLimit;
    private String theme;
    private String role;
    private boolean emailVerified;
    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String email, String password, String fullName,
                           String avatarUrl, Long storageUsed, Long storageLimit,
                           String theme, String role, boolean emailVerified,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.storageUsed = storageUsed;
        this.storageLimit = storageLimit;
        this.theme = theme;
        this.role = role;
        this.emailVerified = emailVerified;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user) {
        String role = user.getRole() != null ? user.getRole() : "USER";
        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
        return new UserDetailsImpl(
                user.getId(), user.getEmail(), user.getPassword(), user.getFullName(),
                user.getAvatarUrl(), user.getStorageUsed(), user.getStorageLimit(),
                user.getTheme(), role, user.isEmailVerified(), authorities);
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getAvatarUrl() { return avatarUrl; }
    public Long getStorageUsed() { return storageUsed; }
    public Long getStorageLimit() { return storageLimit; }
    public String getTheme() { return theme; }
    public String getRole() { return role; }
    public boolean isEmailVerified() { return emailVerified; }

    @Override
    public String getUsername() { return email; }
    @Override
    public String getPassword() { return password; }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}