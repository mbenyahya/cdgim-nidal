package com.cgdim.controller;

import com.cgdim.service.CgdimService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/profiles")
public class ProfileController {

    private final CgdimService service;

    public ProfileController(CgdimService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(required = false) String q) {
        return service.getProfiles(q);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody ProfileCreate body) {
        return service.createProfile(body.name(), body.code(), body.avgSalary())
                .map(item -> ResponseEntity.status(HttpStatus.CREATED).body(item))
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> update(@PathVariable String id, @Valid @RequestBody ProfileCreate body) {
        long idNum;
        try { idNum = Long.parseLong(id); } catch (NumberFormatException e) { return ResponseEntity.badRequest().build(); }
        return service.updateProfile(idNum, body.name(), body.code(), body.avgSalary())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        long idNum;
        try { idNum = Long.parseLong(id); } catch (NumberFormatException e) { return ResponseEntity.badRequest().build(); }
        if (!service.deleteProfile(idNum)) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }

    public record ProfileCreate(@NotBlank String name, @NotBlank String code, Double avgSalary) {}
}
