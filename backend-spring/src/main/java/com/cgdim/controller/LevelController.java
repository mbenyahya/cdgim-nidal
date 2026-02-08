package com.cgdim.controller;

import com.cgdim.service.CgdimService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/levels")
public class LevelController {

    private final CgdimService service;

    public LevelController(CgdimService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return service.getLevels();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody LevelCreate body) {
        return service.createLevel(body.number(), body.label(), body.avgSalary())
                .map(item -> ResponseEntity.status(HttpStatus.CREATED).body(item))
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> update(@PathVariable String id, @Valid @RequestBody LevelCreate body) {
        long idNum;
        try { idNum = Long.parseLong(id); } catch (NumberFormatException e) { return ResponseEntity.badRequest().build(); }
        return service.updateLevel(idNum, body.number(), body.label(), body.avgSalary())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        long idNum;
        try { idNum = Long.parseLong(id); } catch (NumberFormatException e) { return ResponseEntity.badRequest().build(); }
        if (!service.deleteLevel(idNum)) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }

    public record LevelCreate(@Min(1) @Max(8) int number, String label, Double avgSalary) {}
}
