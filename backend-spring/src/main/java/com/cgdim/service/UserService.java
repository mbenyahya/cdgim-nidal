package com.cgdim.service;

import com.cgdim.entity.User;
import com.cgdim.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void ensureDefaultAdmin() {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPasswordHash(passwordEncoder.encode("admin"));
            admin.setEmail("admin@cgdim.local");
            admin.setRole("admin");
            admin.setCreatedAt(Instant.now());
            userRepository.save(admin);
        }
    }

    public Optional<User> validateLogin(String username, String password) {
        return userRepository.findByUsername(username.trim())
                .filter(u -> passwordEncoder.matches(password, u.getPasswordHash()));
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
