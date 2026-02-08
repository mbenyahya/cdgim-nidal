package com.cgdim.controller;

import com.cgdim.service.CgdimService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/export")
public class ExportController {

    private final CgdimService service;

    public ExportController(CgdimService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','EXPERT')")
    public Map<String, Object> export() {
        return service.getAll();
    }
}
