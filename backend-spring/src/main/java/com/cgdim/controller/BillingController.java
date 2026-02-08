package com.cgdim.controller;

import com.cgdim.service.CgdimService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/v1/billing")
public class BillingController {

    private final CgdimService service;

    public BillingController(CgdimService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> get(
            @RequestParam String month,
            @RequestParam(defaultValue = "20") int days,
            @RequestParam(defaultValue = "10.8") double exchange_rate) {
        List<Map<String, Object>> resources = service.getResources(null, null, null);
        List<Map<String, Object>> clients = service.getClients(null);
        List<Map<String, Object>> charges = service.getCharges(null, null);
        Map<String, Object> settings = service.getSettings();
        Map<String, Object> tjmGrids = service.getTjmGrids();
        String model = (String) settings.getOrDefault("tjmModel", "profile");
        double marginGroupePct = toDouble(settings.get("marginCgdim"), 8) / 100;
        double marginHorsGroupePct = toDouble(settings.get("marginHorsGroupe"), 10) / 100;

        List<Map<String, Object>> lines = new ArrayList<>();
        List<Map<String, Object>> linesGroupe = new ArrayList<>();
        List<Map<String, Object>> linesHorsGroupe = new ArrayList<>();
        double grandTotal = 0;
        double grandTotalGroupe = 0;
        double grandTotalHorsGroupe = 0;

        for (Map<String, Object> client : clients) {
            Object cid = client.get("id");
            String scope = "GROUPE".equals(client.get("scope")) ? "GROUPE" : "HORS_GROUPE";
            double marginPct = "HORS_GROUPE".equals(scope) ? marginHorsGroupePct : marginGroupePct;

            List<Map<String, Object>> clientResources = resources.stream()
                    .filter(r -> "productive".equals(r.get("type")) && Objects.equals(r.get("clientId") != null ? r.get("clientId").toString() : null, cid != null ? cid.toString() : null))
                    .toList();
            double baseCa = clientResources.stream().mapToDouble(r -> getTjm(r, tjmGrids, model) * days).sum();
            double clientCharges = charges.stream()
                    .filter(c -> Objects.equals(c.get("clientId") != null ? c.get("clientId").toString() : null, cid != null ? cid.toString() : null))
                    .mapToDouble(c -> toDouble(c.get("amount"), 0))
                    .sum();
            baseCa += clientCharges / exchange_rate;
            double margin = baseCa * marginPct;
            double total = baseCa + margin;
            if (!clientResources.isEmpty() || clientCharges > 0) {
                Map<String, Object> line = Map.of(
                        "client", client,
                        "scope", scope,
                        "resources", clientResources.size(),
                        "baseCa", Math.round(baseCa * 100) / 100.0,
                        "charges", clientCharges,
                        "margin", Math.round(margin * 100) / 100.0,
                        "total", Math.round(total * 100) / 100.0
                );
                lines.add(line);
                grandTotal += total;
                if ("GROUPE".equals(scope)) {
                    linesGroupe.add(line);
                    grandTotalGroupe += total;
                } else {
                    linesHorsGroupe.add(line);
                    grandTotalHorsGroupe += total;
                }
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("month", month);
        result.put("days", days);
        result.put("exchangeRate", exchange_rate);
        result.put("lines", lines);
        result.put("grandTotal", Math.round(grandTotal * 100) / 100.0);
        result.put("linesGroupe", linesGroupe);
        result.put("grandTotalGroupe", Math.round(grandTotalGroupe * 100) / 100.0);
        result.put("linesHorsGroupe", linesHorsGroupe);
        result.put("grandTotalHorsGroupe", Math.round(grandTotalHorsGroupe * 100) / 100.0);
        return result;
    }

    private static double getTjm(Map<String, Object> resource, Map<String, Object> grids, String model) {
        if ("profile".equals(model)) {
            Object pid = resource.get("profileId");
            if (pid == null) return 0;
            Map<String, Object> profile = (Map<String, Object>) grids.get("profile");
            if (profile == null) return 0;
            Map<String, Object> t = (Map<String, Object>) profile.get(pid.toString());
            return t != null ? toDouble(t.get("value"), 0) : 0;
        }
        Object lid = resource.get("levelId");
        if (lid == null) return 0;
        Map<String, Object> level = (Map<String, Object>) grids.get("level");
        if (level == null) return 0;
        Map<String, Object> t = (Map<String, Object>) level.get(lid.toString());
        return t != null ? toDouble(t.get("value"), 0) : 0;
    }

    private static double toDouble(Object v, double def) {
        if (v == null) return def;
        if (v instanceof Number) return ((Number) v).doubleValue();
        try { return Double.parseDouble(v.toString()); } catch (Exception e) { return def; }
    }
}
