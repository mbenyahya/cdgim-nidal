package com.cgdim.controller;

import com.cgdim.service.CgdimService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/settings")
public class SettingsController {

    private final CgdimService service;

    public SettingsController(CgdimService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> get() {
        return service.getSettings();
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> update(@Valid @RequestBody SettingsUpdate body) {
        service.updateSettings(body.marginCgdim(), body.marginOutsourcing(), body.marginHorsGroupe(), body.productiveDaysBudget(), body.exchangeRateBudget(), body.tjmModel());
        return ResponseEntity.ok(service.getSettings());
    }

    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> importBackup(@RequestBody Map<String, Object> body) {
        service.importData(body);
        return ResponseEntity.ok(service.getSettings());
    }

    @PutMapping("/overhead")
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public ResponseEntity<Map<String, Object>> updateOverhead(@RequestBody Map<String, Object> body) {
        Map<String, Object> o = new HashMap<>();
        o.put("rent", toDouble(body.get("rent"), 0));
        o.put("maintenance", toDouble(body.get("maintenance"), 0));
        o.put("cleaning", toDouble(body.get("cleaning"), 0));
        o.put("telecoms", toDouble(body.get("telecoms"), 0));
        o.put("depreciation", toDouble(body.get("depreciation"), 0));
        o.put("other", toDouble(body.get("other"), 0));
        service.updateOverhead(o);
        return ResponseEntity.ok(o);
    }

    @PostMapping("/reset")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> reset() {
        service.reset();
        return ResponseEntity.noContent().build();
    }

    private static double toDouble(Object v, double def) {
        if (v == null) return def;
        if (v instanceof Number) return ((Number) v).doubleValue();
        try { return Double.parseDouble(v.toString()); } catch (Exception e) { return def; }
    }

    public record SettingsUpdate(Double marginCgdim, Double marginOutsourcing, Double marginHorsGroupe, Integer productiveDaysBudget, Double exchangeRateBudget, String tjmModel) {}
}
