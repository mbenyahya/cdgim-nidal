package com.cgdim.controller;

import com.cgdim.entity.Resource;
import com.cgdim.service.CgdimService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/resources")
public class ResourceController {

    private final CgdimService service;

    public ResourceController(CgdimService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String clientId,
            @RequestParam(required = false) String type) {
        return service.getResources(q, clientId, type);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody ResourceCreate body) {
        Resource r = new Resource();
        r.setType(body.type());
        r.setName(body.name());
        r.setProfileId(toLong(body.profileId()));
        r.setLevelId(toLong(body.levelId()));
        r.setEntity(body.entity());
        r.setClientId(toLong(body.clientId()));
        r.setDepartment(body.department());
        r.setSalary(body.salary());
        r.setBonus(body.bonus() != null ? body.bonus() : 0.0);
        r.setStartDate(body.startDate() != null ? body.startDate() : "");
        return service.createResource(r)
                .map(item -> ResponseEntity.status(HttpStatus.CREATED).body(item))
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> update(@PathVariable String id, @Valid @RequestBody ResourceCreate body) {
        long idNum;
        try { idNum = Long.parseLong(id); } catch (NumberFormatException e) { return ResponseEntity.badRequest().build(); }
        Resource r = new Resource();
        r.setType(body.type());
        r.setName(body.name());
        r.setProfileId(toLong(body.profileId()));
        r.setLevelId(toLong(body.levelId()));
        r.setEntity(body.entity());
        r.setClientId(toLong(body.clientId()));
        r.setDepartment(body.department());
        r.setSalary(body.salary());
        r.setBonus(body.bonus() != null ? body.bonus() : 0.0);
        r.setStartDate(body.startDate() != null ? body.startDate() : "");
        return service.updateResource(idNum, r)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        long idNum;
        try { idNum = Long.parseLong(id); } catch (NumberFormatException e) { return ResponseEntity.badRequest().build(); }
        if (!service.deleteResource(idNum)) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }

    private static Long toLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).longValue();
        try { return Long.parseLong(o.toString()); } catch (Exception e) { return null; }
    }

    public record ResourceCreate(
            @NotBlank @Pattern(regexp = "productive|non-productive") String type,
            @NotBlank String name,
            Object profileId, Object levelId,
            @NotBlank @Pattern(regexp = "cgdim|outsourcing") String entity,
            Object clientId, String department,
            double salary, Double bonus, String startDate
    ) {}
}
