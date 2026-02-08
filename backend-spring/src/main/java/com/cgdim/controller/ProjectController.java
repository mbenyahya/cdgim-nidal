package com.cgdim.controller;

import com.cgdim.service.CgdimService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final CgdimService service;

    public ProjectController(CgdimService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) String status) {
        return service.getProjects(q, clientId, status);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody ProjectCreate body) {
        LocalDate start = body.startDate() != null ? LocalDate.parse(body.startDate()) : null;
        LocalDate end = body.endDate() != null ? LocalDate.parse(body.endDate()) : null;
        return service.createProject(body.name(), body.code(), body.clientId(), body.billingType(), start, end, body.status())
                .map(item -> ResponseEntity.status(HttpStatus.CREATED).body(item))
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> update(@PathVariable String id, @Valid @RequestBody ProjectUpdate body) {
        long idNum;
        try { idNum = Long.parseLong(id); } catch (NumberFormatException e) { return ResponseEntity.badRequest().build(); }
        LocalDate start = body.startDate() != null ? LocalDate.parse(body.startDate()) : null;
        LocalDate end = body.endDate() != null ? LocalDate.parse(body.endDate()) : null;
        return service.updateProject(idNum, body.name(), body.code(), body.clientId(), body.billingType(), start, end, body.status())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        long idNum;
        try { idNum = Long.parseLong(id); } catch (NumberFormatException e) { return ResponseEntity.badRequest().build(); }
        if (!service.deleteProject(idNum)) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }

    public record ProjectCreate(
            @NotBlank String name,
            @NotBlank String code,
            @NotNull Long clientId,
            String billingType,
            String startDate,
            String endDate,
            String status
    ) {}

    public record ProjectUpdate(
            String name,
            String code,
            Long clientId,
            String billingType,
            String startDate,
            String endDate,
            String status
    ) {}
}
