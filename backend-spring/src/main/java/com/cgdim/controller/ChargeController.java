package com.cgdim.controller;

import com.cgdim.service.CgdimService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/charges")
public class ChargeController {

    private final CgdimService service;

    public ChargeController(CgdimService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String clientId) {
        return service.getCharges(q, clientId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody ChargeCreate body) {
        Long clientId = toLong(body.clientId());
        Long resourceId = toLong(body.resourceId());
        if (clientId == null) return ResponseEntity.badRequest().build();
        return service.createCharge(body.type(), clientId, resourceId, body.amount(), body.date(), body.description())
                .map(item -> ResponseEntity.status(HttpStatus.CREATED).body(item))
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> update(@PathVariable String id, @Valid @RequestBody ChargeCreate body) {
        long idNum;
        try { idNum = Long.parseLong(id); } catch (NumberFormatException e) { return ResponseEntity.badRequest().build(); }
        Long clientId = toLong(body.clientId());
        Long resourceId = toLong(body.resourceId());
        if (clientId == null) return ResponseEntity.badRequest().build();
        return service.updateCharge(idNum, body.type(), clientId, resourceId, body.amount(), body.date(), body.description())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        long idNum;
        try { idNum = Long.parseLong(id); } catch (NumberFormatException e) { return ResponseEntity.badRequest().build(); }
        if (!service.deleteCharge(idNum)) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }

    private static Long toLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).longValue();
        try { return Long.parseLong(o.toString()); } catch (Exception e) { return null; }
    }

    public record ChargeCreate(
            @NotBlank @Pattern(regexp = "deplacement|reception|formation|licenciement|autre") String type,
            @NotNull Object clientId, Object resourceId,
            double amount, @NotBlank String date, String description
    ) {}
}
