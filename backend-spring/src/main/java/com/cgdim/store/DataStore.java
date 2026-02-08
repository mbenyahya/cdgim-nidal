package com.cgdim.store;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/** Legacy file-based store: replaced by CgdimService + PostgreSQL. Kept for reference. */
// @Component
public class DataStore {

    @Value("${cgdim.data.file:data/cgdim_data.json}")
    private String dataFile;

    private final ObjectMapper mapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
    private final Map<String, Object> data = new ConcurrentHashMap<>();

    @PostConstruct
    public void load() {
        Path path = Paths.get(dataFile);
        if (Files.exists(path)) {
            try {
                String json = Files.readString(path);
                @SuppressWarnings("unchecked")
                Map<String, Object> loaded = mapper.readValue(json, Map.class);
                data.clear();
                data.putAll(normalize(loaded));
            } catch (IOException e) {
                initDefault();
            }
        } else {
            initDefault();
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> normalize(Map<String, Object> m) {
        Map<String, Object> out = new HashMap<>();
        for (Map.Entry<String, Object> e : m.entrySet()) {
            Object v = e.getValue();
            if (v instanceof List) out.put(e.getKey(), new ArrayList<>((List<?>) v));
            else if (v instanceof Map) out.put(e.getKey(), new HashMap<>((Map<?, ?>) v));
            else out.put(e.getKey(), v);
        }
        return out;
    }

    private void initDefault() {
        data.put("profiles", new ArrayList<Map<String, Object>>());
        data.put("levels", new ArrayList<Map<String, Object>>());
        data.put("tjmGrids", new HashMap<>(Map.of("profile", new HashMap<String, Object>(), "level", new HashMap<String, Object>())));
        data.put("resources", new ArrayList<Map<String, Object>>());
        data.put("clients", new ArrayList<Map<String, Object>>());
        data.put("charges", new ArrayList<Map<String, Object>>());
        data.put("settings", new HashMap<>(Map.of(
                "tjmModel", "profile",
                "marginCgdim", 8,
                "marginOutsourcing", 5,
                "productiveDaysBudget", 229,
                "exchangeRateBudget", 10.8,
                "overhead", new HashMap<>(Map.of("rent", 0, "maintenance", 0, "cleaning", 0, "telecoms", 0, "depreciation", 0, "other", 0))
        )));
    }

    public void persist() {
        try {
            Path path = Paths.get(dataFile);
            Files.createDirectories(path.getParent());
            Files.writeString(path, mapper.writeValueAsString(data));
        } catch (IOException ignored) {}
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getProfiles() { return (List<Map<String, Object>>) data.computeIfAbsent("profiles", k -> new ArrayList<>()); }
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getLevels() { return (List<Map<String, Object>>) data.computeIfAbsent("levels", k -> new ArrayList<>()); }
    @SuppressWarnings("unchecked")
    public Map<String, Object> getTjmGrids() { return (Map<String, Object>) data.computeIfAbsent("tjmGrids", k -> new HashMap<>(Map.of("profile", new HashMap<>(), "level", new HashMap<>()))); }
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getResources() { return (List<Map<String, Object>>) data.computeIfAbsent("resources", k -> new ArrayList<>()); }
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getClients() { return (List<Map<String, Object>>) data.computeIfAbsent("clients", k -> new ArrayList<>()); }
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getCharges() { return (List<Map<String, Object>>) data.computeIfAbsent("charges", k -> new ArrayList<>()); }
    @SuppressWarnings("unchecked")
    public Map<String, Object> getSettings() { return (Map<String, Object>) data.computeIfAbsent("settings", k -> new HashMap<>()); }

    public Map<String, Object> getAll() {
        Map<String, Object> copy = new HashMap<>();
        copy.put("profiles", new ArrayList<>(getProfiles()));
        copy.put("levels", new ArrayList<>(getLevels()));
        copy.put("tjmGrids", new HashMap<>(getTjmGrids()));
        copy.put("resources", new ArrayList<>(getResources()));
        copy.put("clients", new ArrayList<>(getClients()));
        copy.put("charges", new ArrayList<>(getCharges()));
        copy.put("settings", new HashMap<>(getSettings()));
        return copy;
    }

    public void reset() {
        data.clear();
        initDefault();
        persist();
    }

    /** Import full data from JSON (e.g. backup restore). Merges into existing structure. */
    @SuppressWarnings("unchecked")
    public void importData(Map<String, Object> imported) {
        if (imported == null || imported.isEmpty()) return;
        Map<String, Object> normalized = normalize(imported);
        for (String key : List.of("profiles", "levels", "tjmGrids", "resources", "clients", "charges", "settings")) {
            if (normalized.containsKey(key)) data.put(key, normalized.get(key));
        }
        persist();
    }
}
