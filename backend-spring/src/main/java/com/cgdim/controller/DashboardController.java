package com.cgdim.controller;

import com.cgdim.service.CgdimService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final CgdimService service;

    public DashboardController(CgdimService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> get() {
        List<Map<String, Object>> resources = service.getResources(null, null, null);
        List<Map<String, Object>> profiles = service.getProfiles(null);
        List<Map<String, Object>> clients = service.getClients(null);
        List<Map<String, Object>> charges = service.getCharges(null, null);
        Map<String, Object> settings = service.getSettings();
        Map<String, Object> tjmGrids = service.getTjmGrids();
        double rate = toDouble(settings.get("exchangeRateBudget"), 10.8);
        double marginGroupePct = toDouble(settings.get("marginCgdim"), 8) / 100;
        double marginHorsGroupePct = toDouble(settings.get("marginHorsGroupe"), 10) / 100;
        String model = (String) settings.getOrDefault("tjmModel", "profile");

        Map<Object, String> clientScope = new HashMap<>();
        for (Map<String, Object> c : clients) {
            Object id = c.get("id");
            String scope = (String) c.getOrDefault("scope", "GROUPE");
            if (id != null) clientScope.put(id.toString(), "HORS_GROUPE".equals(scope) ? "HORS_GROUPE" : "GROUPE");
        }

        List<Map<String, Object>> productive = resources.stream().filter(r -> "productive".equals(r.get("type"))).toList();
        List<Map<String, Object>> nonProductive = resources.stream().filter(r -> "non-productive".equals(r.get("type"))).toList();

        double totalCa = productive.stream().mapToDouble(r -> getTjm(r, tjmGrids, model) * 20).sum();
        double monthlyCharges = charges.stream().mapToDouble(c -> toDouble(c.get("amount"), 0)).sum();
        totalCa += monthlyCharges / rate;
        totalCa += totalCa * marginGroupePct;

        double directCosts = productive.stream().mapToDouble(r -> toDouble(r.get("salary"), 0) + toDouble(r.get("bonus"), 0)).sum() + monthlyCharges;
        double indirectCosts = nonProductive.stream().mapToDouble(r -> toDouble(r.get("salary"), 0) + toDouble(r.get("bonus"), 0)).sum();
        @SuppressWarnings("unchecked")
        Map<String, Object> overhead = (Map<String, Object>) settings.getOrDefault("overhead", Map.of());
        indirectCosts += overhead.values().stream().mapToDouble(v -> toDouble(v, 0)).sum();
        double marginEur = totalCa - directCosts / rate - indirectCosts / rate;

        Map<String, Double> profileBreakdown = new LinkedHashMap<>();
        for (Map<String, Object> r : productive) {
            Object pid = r.get("profileId");
            if (pid == null) continue;
            String pname = profiles.stream().filter(p -> Objects.equals(p.get("id").toString(), pid.toString())).findFirst().map(p -> (String) p.get("name")).orElse(null);
            if (pname != null) profileBreakdown.merge(pname, getTjm(r, tjmGrids, model) * 20, Double::sum);
        }

        Map<String, Double> clientCa = new LinkedHashMap<>();
        for (Map<String, Object> r : productive) {
            Object cid = r.get("clientId");
            if (cid == null) continue;
            String cname = clients.stream().filter(c -> Objects.equals(c.get("id").toString(), cid.toString())).findFirst().map(c -> (String) c.get("name")).orElse(null);
            if (cname != null) clientCa.merge(cname, getTjm(r, tjmGrids, model) * 20, Double::sum);
        }
        List<Map<String, Object>> topClients = clientCa.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(5)
                .map(e -> Map.<String, Object>of("name", e.getKey(), "ca", Math.round(e.getValue() * 100) / 100.0))
                .toList();

        Map<String, Object> kpis = Map.of(
                "productive", productive.size(),
                "nonProductive", nonProductive.size(),
                "totalCa", Math.round(totalCa * 100) / 100.0,
                "directCosts", Math.round((directCosts / rate) * 100) / 100.0,
                "indirectCosts", Math.round((indirectCosts / rate) * 100) / 100.0,
                "margin", Math.round(marginEur * 100) / 100.0
        );

        Map<String, Object> plGroupe = computePlByScope(productive, charges, nonProductive, overhead, clients, clientScope, tjmGrids, model, rate, marginGroupePct, "GROUPE");
        Map<String, Object> plHorsGroupe = computePlByScope(productive, charges, nonProductive, overhead, clients, clientScope, tjmGrids, model, rate, marginHorsGroupePct, "HORS_GROUPE");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("kpis", kpis);
        result.put("profileBreakdown", profileBreakdown);
        result.put("topClients", topClients);
        result.put("plGroupe", plGroupe);
        result.put("plHorsGroupe", plHorsGroupe);
        result.put("settings", Map.of(
                "tjmModel", model,
                "productiveDaysBudget", settings.getOrDefault("productiveDaysBudget", 229),
                "exchangeRateBudget", rate,
                "marginCgdim", settings.getOrDefault("marginCgdim", 8),
                "marginHorsGroupe", settings.getOrDefault("marginHorsGroupe", 10)
        ));
        return result;
    }

    private static Map<String, Object> computePlByScope(
            List<Map<String, Object>> productive,
            List<Map<String, Object>> charges,
            List<Map<String, Object>> nonProductive,
            Map<String, Object> overhead,
            List<Map<String, Object>> clients,
            Map<Object, String> clientScope,
            Map<String, Object> tjmGrids,
            String model,
            double rate,
            double marginPct,
            String scope) {
        Set<String> scopeClientIds = new HashSet<>();
        for (Map.Entry<Object, String> e : clientScope.entrySet()) {
            if (scope.equals(e.getValue())) scopeClientIds.add(e.getKey().toString());
        }
        List<Map<String, Object>> prodScope = productive.stream()
                .filter(r -> r.get("clientId") != null && scopeClientIds.contains(r.get("clientId").toString()))
                .toList();
        double caBase = prodScope.stream().mapToDouble(r -> getTjm(r, tjmGrids, model) * 20).sum();
        double chargesScope = charges.stream()
                .filter(c -> c.get("clientId") != null && scopeClientIds.contains(c.get("clientId").toString()))
                .mapToDouble(c -> toDouble(c.get("amount"), 0)).sum();
        caBase += chargesScope / rate;
        double marginAmount = caBase * marginPct;
        double totalCa = caBase + marginAmount;
        double directCosts = prodScope.stream().mapToDouble(r -> toDouble(r.get("salary"), 0) + toDouble(r.get("bonus"), 0)).sum() + chargesScope;
        double totalDirect = productive.stream().mapToDouble(r -> toDouble(r.get("salary"), 0) + toDouble(r.get("bonus"), 0)).sum()
                + charges.stream().mapToDouble(c -> toDouble(c.get("amount"), 0)).sum();
        double indirectTotal = nonProductive.stream().mapToDouble(r -> toDouble(r.get("salary"), 0) + toDouble(r.get("bonus"), 0)).sum();
        indirectTotal += overhead.values().stream().mapToDouble(v -> toDouble(v, 0)).sum();
        double indirectScope = totalDirect > 0 ? indirectTotal * (directCosts / totalDirect) : 0;
        double marginEur = totalCa - directCosts / rate - indirectScope / rate;
        return Map.of(
                "productive", prodScope.size(),
                "totalCa", Math.round(totalCa * 100) / 100.0,
                "directCosts", Math.round((directCosts / rate) * 100) / 100.0,
                "indirectCosts", Math.round((indirectScope / rate) * 100) / 100.0,
                "margin", Math.round(marginEur * 100) / 100.0,
                "marginPct", Math.round(marginPct * 10000) / 100.0
        );
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
