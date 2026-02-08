package com.cgdim.controller;

import com.cgdim.service.CgdimService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/assignments")
public class AssignmentController {

    private final CgdimService service;

    public AssignmentController(CgdimService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> list(
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) Long projectId) {
        return service.getAssignments(resourceId, projectId);
    }

    @GetMapping("/by-resource/{resourceId}")
    public List<Map<String, Object>> byResource(@PathVariable Long resourceId) {
        return service.getAssignmentsByResource(resourceId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody AssignmentCreate body) {
        LocalDate start = body.startDate() != null ? LocalDate.parse(body.startDate()) : null;
        LocalDate end = body.endDate() != null ? LocalDate.parse(body.endDate()) : null;
        return service.createAssignment(body.resourceId(), body.projectId(), body.assignedByUserId(), start, end, body.allocationRate())
                .map(item -> ResponseEntity.status(HttpStatus.CREATED).body(item))
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> update(@PathVariable String id, @Valid @RequestBody AssignmentUpdate body) {
        long idNum;
        try { idNum = Long.parseLong(id); } catch (NumberFormatException e) { return ResponseEntity.badRequest().build(); }
        LocalDate start = body.startDate() != null ? LocalDate.parse(body.startDate()) : null;
        LocalDate end = body.endDate() != null ? LocalDate.parse(body.endDate()) : null;
        return service.updateAssignment(idNum, body.resourceId(), body.projectId(), body.assignedByUserId(), start, end, body.allocationRate())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        long idNum;
        try { idNum = Long.parseLong(id); } catch (NumberFormatException e) { return ResponseEntity.badRequest().build(); }
        if (!service.deleteAssignment(idNum)) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }

    public record AssignmentCreate(
            @NotNull Long resourceId,
            @NotNull Long projectId,
            @NotNull Long assignedByUserId,
            @NotNull String startDate,
            String endDate,
            Integer allocationRate
    ) {}

    public record AssignmentUpdate(
            Long resourceId,
            Long projectId,
            Long assignedByUserId,
            String startDate,
            String endDate,
            Integer allocationRate
    ) {}
}
