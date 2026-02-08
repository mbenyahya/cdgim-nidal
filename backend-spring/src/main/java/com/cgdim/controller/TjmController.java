package com.cgdim.controller;

import com.cgdim.service.CgdimService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/tjm")
public class TjmController {

    private final CgdimService service;

    public TjmController(CgdimService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> get() {
        Map<String, Object> grids = service.getTjmGrids();
        String model = (String) service.getSettings().getOrDefault("tjmModel", "profile");
        return Map.of("tjmModel", model, "grids", grids);
    }

    @PutMapping("/model")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, String>> setModel(@Valid @RequestBody TjmModelUpdate body) {
        service.setTjmModel(body.tjmModel());
        return ResponseEntity.ok(Map.of("tjmModel", body.tjmModel()));
    }

    @PostMapping("/profile/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> setProfile(@PathVariable String id, @Valid @RequestBody TjmEntry body) {
        service.setTjmProfile(id, body.value(), body.date());
        return ResponseEntity.ok(Map.of("value", body.value(), "date", body.date() != null ? body.date() : ""));
    }

    @PostMapping("/level/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> setLevel(@PathVariable String id, @Valid @RequestBody TjmEntry body) {
        service.setTjmLevel(id, body.value(), body.date());
        return ResponseEntity.ok(Map.of("value", body.value(), "date", body.date() != null ? body.date() : ""));
    }

    public record TjmModelUpdate(@Pattern(regexp = "profile|level") String tjmModel) {}
    public record TjmEntry(double value, String date) {}
}
