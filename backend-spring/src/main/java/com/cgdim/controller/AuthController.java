package com.cgdim.controller;

import com.cgdim.entity.User;
import com.cgdim.security.JwtUtil;
import com.cgdim.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserService userService;

    public AuthController(JwtUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest body) {
        var userOpt = userService.validateLogin(body.username(), body.password());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User user = userOpt.get();
        String role = user.getRole() != null ? user.getRole().toLowerCase() : "user";
        String token = jwtUtil.createToken(user.getUsername(), role, user.getResourceId());
        var response = new java.util.HashMap<String, Object>();
        response.put("access_token", token);
        response.put("token_type", "bearer");
        response.put("username", user.getUsername());
        response.put("role", role);
        if (user.getResourceId() != null) {
            response.put("resourceId", user.getResourceId());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        String role = user.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", "").toLowerCase())
                .findFirst().orElse("user");
        var out = new java.util.HashMap<String, Object>();
        out.put("username", user.getUsername());
        out.put("role", role);
        userService.findByUsername(user.getUsername()).ifPresent(u -> {
            if (u.getResourceId() != null) out.put("resourceId", u.getResourceId());
        });
        return ResponseEntity.ok(out);
    }

    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {}
}
