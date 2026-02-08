package com.cgdim.service;

import com.cgdim.entity.*;
import com.cgdim.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service layer that replaces DataStore: uses PostgreSQL via JPA repositories
 * and exposes the same API (List/Map) for backward compatibility with controllers.
 */
@Service
public class CgdimService {

    private final ProfileRepository profileRepository;
    private final LevelRepository levelRepository;
    private final ClientRepository clientRepository;
    private final ResourceRepository resourceRepository;
    private final ChargeRepository chargeRepository;
    private final AppSettingsRepository appSettingsRepository;
    private final TjmEntryRepository tjmEntryRepository;
    private final ProjectRepository projectRepository;
    private final AssignmentRepository assignmentRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CgdimService(ProfileRepository profileRepository, LevelRepository levelRepository,
                        ClientRepository clientRepository, ResourceRepository resourceRepository,
                        ChargeRepository chargeRepository, AppSettingsRepository appSettingsRepository,
                        TjmEntryRepository tjmEntryRepository, ProjectRepository projectRepository,
                        AssignmentRepository assignmentRepository) {
        this.profileRepository = profileRepository;
        this.levelRepository = levelRepository;
        this.clientRepository = clientRepository;
        this.resourceRepository = resourceRepository;
        this.chargeRepository = chargeRepository;
        this.appSettingsRepository = appSettingsRepository;
        this.tjmEntryRepository = tjmEntryRepository;
        this.projectRepository = projectRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @PostConstruct
    public void initDefaultSettings() {
        if (appSettingsRepository.count() == 0) {
            AppSettings def = new AppSettings();
            def.setId(1L);
            def.setTjmModel("profile");
            def.setMarginCgdim(8.0);
            def.setMarginOutsourcing(5.0);
            def.setMarginHorsGroupe(10.0);
            def.setProductiveDaysBudget(229);
            def.setExchangeRateBudget(10.8);
            def.setOverheadJson("{\"rent\":0,\"maintenance\":0,\"cleaning\":0,\"telecoms\":0,\"depreciation\":0,\"other\":0}");
            appSettingsRepository.save(def);
        }
    }

    // --- Clients ---
    public List<Map<String, Object>> getClients(String q) {
        List<Client> list = (q == null || q.isBlank())
                ? clientRepository.findAll()
                : clientRepository.findByNameContainingIgnoreCaseOrCodeContainingIgnoreCaseOrDescriptionContainingIgnoreCase(q.trim(), q.trim(), q.trim());
        return list.stream().map(this::toMap).collect(Collectors.toList());
    }

    public Optional<Map<String, Object>> createClient(String name, String code, String description, String scope) {
        Client c = new Client();
        c.setName(name);
        c.setCode(code != null ? code : "");
        c.setDescription(description != null ? description : "");
        c.setScope(scope != null && ("GROUPE".equals(scope) || "HORS_GROUPE".equals(scope)) ? scope : "GROUPE");
        return Optional.of(toMap(clientRepository.save(c)));
    }

    public Optional<Map<String, Object>> updateClient(Long id, String name, String code, String description, String scope) {
        return clientRepository.findById(id).map(c -> {
            c.setName(name);
            c.setCode(code);
            c.setDescription(description != null ? description : "");
            if (scope != null && ("GROUPE".equals(scope) || "HORS_GROUPE".equals(scope))) c.setScope(scope);
            return toMap(clientRepository.save(c));
        });
    }

    public boolean deleteClient(Long id) {
        if (!clientRepository.existsById(id)) return false;
        clientRepository.deleteById(id);
        return true;
    }

    private Map<String, Object> toMap(Client c) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("name", c.getName());
        m.put("code", c.getCode());
        m.put("description", c.getDescription() != null ? c.getDescription() : "");
        m.put("scope", c.getScope() != null ? c.getScope() : "GROUPE");
        return m;
    }

    // --- Profiles ---
    public List<Map<String, Object>> getProfiles(String q) {
        List<Profile> list = (q == null || q.isBlank())
                ? profileRepository.findAll()
                : profileRepository.findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(q.trim(), q.trim());
        return list.stream().map(this::toMap).collect(Collectors.toList());
    }

    public Optional<Map<String, Object>> createProfile(String name, String code, Double avgSalary) {
        Profile p = new Profile();
        p.setName(name);
        p.setCode(code);
        p.setAvgSalary(avgSalary != null ? avgSalary : 0.0);
        return Optional.of(toMap(profileRepository.save(p)));
    }

    public Optional<Map<String, Object>> updateProfile(Long id, String name, String code, Double avgSalary) {
        return profileRepository.findById(id).map(p -> {
            p.setName(name);
            p.setCode(code);
            p.setAvgSalary(avgSalary != null ? avgSalary : 0.0);
            return toMap(profileRepository.save(p));
        });
    }

    public boolean deleteProfile(Long id) {
        if (!profileRepository.existsById(id)) return false;
        profileRepository.deleteById(id);
        return true;
    }

    private Map<String, Object> toMap(Profile p) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", p.getId());
        m.put("name", p.getName());
        m.put("code", p.getCode());
        m.put("avgSalary", p.getAvgSalary() != null ? p.getAvgSalary() : 0);
        return m;
    }

    // --- Levels ---
    public List<Map<String, Object>> getLevels() {
        return levelRepository.findAllByOrderByNumberAsc().stream().map(this::toMap).collect(Collectors.toList());
    }

    public Optional<Map<String, Object>> createLevel(int number, String label, Double avgSalary) {
        Level l = new Level();
        l.setNumber(number);
        l.setLabel(label != null ? label : "");
        l.setAvgSalary(avgSalary != null ? avgSalary : 0.0);
        return Optional.of(toMap(levelRepository.save(l)));
    }

    public Optional<Map<String, Object>> updateLevel(Long id, int number, String label, Double avgSalary) {
        return levelRepository.findById(id).map(l -> {
            l.setNumber(number);
            l.setLabel(label != null ? label : "");
            l.setAvgSalary(avgSalary != null ? avgSalary : 0.0);
            return toMap(levelRepository.save(l));
        });
    }

    public boolean deleteLevel(Long id) {
        if (!levelRepository.existsById(id)) return false;
        levelRepository.deleteById(id);
        return true;
    }

    private Map<String, Object> toMap(Level l) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", l.getId());
        m.put("number", l.getNumber());
        m.put("label", l.getLabel() != null ? l.getLabel() : "");
        m.put("avgSalary", l.getAvgSalary() != null ? l.getAvgSalary() : 0);
        return m;
    }

    // --- Resources ---
    public List<Map<String, Object>> getResources(String q, String clientId, String type) {
        List<Resource> list = resourceRepository.findAll();
        if (q != null && !q.isBlank()) {
            String lower = q.trim().toLowerCase();
            list = list.stream().filter(r -> r.getName() != null && r.getName().toLowerCase().contains(lower)).collect(Collectors.toList());
        }
        if (clientId != null && !clientId.isBlank()) {
            list = list.stream().filter(r -> r.getClientId() != null && clientId.equals(r.getClientId().toString())).collect(Collectors.toList());
        }
        if (type != null && !type.isBlank()) {
            list = list.stream().filter(r -> type.equals(r.getType())).collect(Collectors.toList());
        }
        return list.stream().map(this::toMap).collect(Collectors.toList());
    }

    public Optional<Map<String, Object>> createResource(Resource r) {
        return Optional.of(toMap(resourceRepository.save(r)));
    }

    public Optional<Map<String, Object>> updateResource(Long id, Resource r) {
        return resourceRepository.findById(id).map(existing -> {
            existing.setType(r.getType());
            existing.setName(r.getName());
            existing.setProfileId(r.getProfileId());
            existing.setLevelId(r.getLevelId());
            existing.setEntity(r.getEntity());
            existing.setClientId(r.getClientId());
            existing.setDepartment(r.getDepartment());
            existing.setSalary(r.getSalary());
            existing.setBonus(r.getBonus() != null ? r.getBonus() : 0.0);
            existing.setStartDate(r.getStartDate() != null ? r.getStartDate() : "");
            return toMap(resourceRepository.save(existing));
        });
    }

    public boolean deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) return false;
        resourceRepository.deleteById(id);
        return true;
    }

    private Map<String, Object> toMap(Resource r) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", r.getId());
        m.put("type", r.getType());
        m.put("name", r.getName());
        m.put("profileId", r.getProfileId());
        m.put("levelId", r.getLevelId());
        m.put("entity", r.getEntity());
        m.put("clientId", r.getClientId());
        m.put("department", r.getDepartment());
        m.put("salary", r.getSalary());
        m.put("bonus", r.getBonus() != null ? r.getBonus() : 0);
        m.put("startDate", r.getStartDate() != null ? r.getStartDate() : "");
        return m;
    }

    // --- Charges ---
    public List<Map<String, Object>> getCharges(String q, String clientId) {
        List<Charge> list = chargeRepository.findAll();
        if (q != null && !q.isBlank()) {
            String lower = q.trim().toLowerCase();
            list = list.stream().filter(c -> (c.getType() != null && c.getType().toLowerCase().contains(lower))
                    || (c.getDescription() != null && c.getDescription().toLowerCase().contains(lower))).collect(Collectors.toList());
        }
        if (clientId != null && !clientId.isBlank()) {
            list = list.stream().filter(c -> c.getClientId() != null && clientId.equals(c.getClientId().toString())).collect(Collectors.toList());
        }
        return list.stream().map(this::toMap).collect(Collectors.toList());
    }

    public Optional<Map<String, Object>> createCharge(String type, Long clientId, Long resourceId, double amount, String date, String description) {
        Charge c = new Charge();
        c.setType(type);
        c.setClientId(clientId);
        c.setResourceId(resourceId);
        c.setAmount(amount);
        c.setDate(date);
        c.setDescription(description != null ? description : "");
        return Optional.of(toMap(chargeRepository.save(c)));
    }

    public Optional<Map<String, Object>> updateCharge(Long id, String type, Long clientId, Long resourceId, double amount, String date, String description) {
        return chargeRepository.findById(id).map(c -> {
            c.setType(type);
            c.setClientId(clientId);
            c.setResourceId(resourceId);
            c.setAmount(amount);
            c.setDate(date);
            c.setDescription(description != null ? description : "");
            return toMap(chargeRepository.save(c));
        });
    }

    public boolean deleteCharge(Long id) {
        if (!chargeRepository.existsById(id)) return false;
        chargeRepository.deleteById(id);
        return true;
    }

    private Map<String, Object> toMap(Charge c) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("type", c.getType());
        m.put("clientId", c.getClientId());
        m.put("resourceId", c.getResourceId() != null ? c.getResourceId() : "");
        m.put("amount", c.getAmount());
        m.put("date", c.getDate());
        m.put("description", c.getDescription() != null ? c.getDescription() : "");
        return m;
    }

    // --- Settings ---
    public Map<String, Object> getSettings() {
        Map<String, Object> out = new HashMap<>();
        appSettingsRepository.findById(1L).ifPresent(s -> {
            out.put("tjmModel", s.getTjmModel() != null ? s.getTjmModel() : "profile");
            out.put("marginCgdim", s.getMarginCgdim() != null ? s.getMarginCgdim() : 8);
            out.put("marginOutsourcing", s.getMarginOutsourcing() != null ? s.getMarginOutsourcing() : 5);
            out.put("marginHorsGroupe", s.getMarginHorsGroupe() != null ? s.getMarginHorsGroupe() : 10);
            out.put("productiveDaysBudget", s.getProductiveDaysBudget() != null ? s.getProductiveDaysBudget() : 229);
            out.put("exchangeRateBudget", s.getExchangeRateBudget() != null ? s.getExchangeRateBudget() : 10.8);
            try {
                if (s.getOverheadJson() != null && !s.getOverheadJson().isBlank()) {
                    out.put("overhead", objectMapper.readValue(s.getOverheadJson(), new TypeReference<Map<String, Object>>() {}));
                } else {
                    out.put("overhead", defaultOverhead());
                }
            } catch (Exception e) {
                out.put("overhead", defaultOverhead());
            }
        });
        if (out.isEmpty()) {
            out.put("tjmModel", "profile");
            out.put("marginCgdim", 8);
            out.put("marginOutsourcing", 5);
            out.put("marginHorsGroupe", 10);
            out.put("productiveDaysBudget", 229);
            out.put("exchangeRateBudget", 10.8);
            out.put("overhead", defaultOverhead());
        }
        return out;
    }

    private Map<String, Object> defaultOverhead() {
        Map<String, Object> o = new HashMap<>();
        o.put("rent", 0);
        o.put("maintenance", 0);
        o.put("cleaning", 0);
        o.put("telecoms", 0);
        o.put("depreciation", 0);
        o.put("other", 0);
        return o;
    }

    public void updateSettings(Double marginCgdim, Double marginOutsourcing, Double marginHorsGroupe, Integer productiveDaysBudget, Double exchangeRateBudget, String tjmModel) {
        AppSettings s = appSettingsRepository.findById(1L).orElseGet(() -> { AppSettings def = new AppSettings(); def.setId(1L); return def; });
        if (marginCgdim != null) s.setMarginCgdim(marginCgdim);
        if (marginOutsourcing != null) s.setMarginOutsourcing(marginOutsourcing);
        if (marginHorsGroupe != null) s.setMarginHorsGroupe(marginHorsGroupe);
        if (productiveDaysBudget != null) s.setProductiveDaysBudget(productiveDaysBudget);
        if (exchangeRateBudget != null) s.setExchangeRateBudget(exchangeRateBudget);
        if (tjmModel != null) s.setTjmModel(tjmModel);
        appSettingsRepository.save(s);
    }

    public void updateOverhead(Map<String, Object> overhead) {
        AppSettings s = appSettingsRepository.findById(1L).orElseGet(() -> { AppSettings def = new AppSettings(); def.setId(1L); return def; });
        try {
            s.setOverheadJson(objectMapper.writeValueAsString(overhead));
        } catch (Exception ignored) {}
        appSettingsRepository.save(s);
    }

    // --- Projects ---
    public List<Map<String, Object>> getProjects(String q, Long clientId, String status) {
        List<Project> list = projectRepository.findAll();
        if (q != null && !q.isBlank()) {
            String lower = q.trim().toLowerCase();
            list = list.stream().filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(lower))
                    || (p.getCode() != null && p.getCode().toLowerCase().contains(lower))).collect(Collectors.toList());
        }
        if (clientId != null) {
            list = list.stream().filter(p -> clientId.equals(p.getClientId())).collect(Collectors.toList());
        }
        if (status != null && !status.isBlank()) {
            list = list.stream().filter(p -> status.equals(p.getStatus())).collect(Collectors.toList());
        }
        return list.stream().map(this::toMap).collect(Collectors.toList());
    }

    public Optional<Map<String, Object>> createProject(String name, String code, Long clientId, String billingType,
                                                        java.time.LocalDate startDate, java.time.LocalDate endDate, String status) {
        Project p = new Project();
        p.setName(name);
        p.setCode(code != null ? code : "");
        p.setClientId(clientId);
        p.setBillingType(billingType != null ? billingType : "TJM");
        p.setStartDate(startDate);
        p.setEndDate(endDate);
        p.setStatus(status != null ? status : "ACTIVE");
        return Optional.of(toMap(projectRepository.save(p)));
    }

    public Optional<Map<String, Object>> updateProject(Long id, String name, String code, Long clientId, String billingType,
                                                       java.time.LocalDate startDate, java.time.LocalDate endDate, String status) {
        return projectRepository.findById(id).map(p -> {
            if (name != null) p.setName(name);
            if (code != null) p.setCode(code);
            if (clientId != null) p.setClientId(clientId);
            if (billingType != null) p.setBillingType(billingType);
            if (startDate != null) p.setStartDate(startDate);
            if (endDate != null) p.setEndDate(endDate);
            if (status != null) p.setStatus(status);
            return toMap(projectRepository.save(p));
        });
    }

    public boolean deleteProject(Long id) {
        if (!projectRepository.existsById(id)) return false;
        projectRepository.deleteById(id);
        return true;
    }

    private Map<String, Object> toMap(Project p) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", p.getId());
        m.put("name", p.getName());
        m.put("code", p.getCode());
        m.put("clientId", p.getClientId());
        m.put("billingType", p.getBillingType());
        m.put("startDate", p.getStartDate() != null ? p.getStartDate().toString() : null);
        m.put("endDate", p.getEndDate() != null ? p.getEndDate().toString() : null);
        m.put("status", p.getStatus());
        return m;
    }

    // --- Assignments ---
    public List<Map<String, Object>> getAssignments(Long resourceId, Long projectId) {
        List<Assignment> list;
        if (resourceId != null && projectId != null) {
            list = assignmentRepository.findByResourceId(resourceId).stream()
                    .filter(a -> projectId.equals(a.getProjectId())).collect(Collectors.toList());
        } else if (resourceId != null) {
            list = assignmentRepository.findByResourceId(resourceId);
        } else if (projectId != null) {
            list = assignmentRepository.findByProjectId(projectId);
        } else {
            list = assignmentRepository.findAll();
        }
        return list.stream().map(this::toMap).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAssignmentsByResource(Long resourceId) {
        return assignmentRepository.findByResourceId(resourceId).stream().map(this::toMap).collect(Collectors.toList());
    }

    public Optional<Map<String, Object>> createAssignment(Long resourceId, Long projectId, Long assignedByUserId,
                                                          java.time.LocalDate startDate, java.time.LocalDate endDate, Integer allocationRate) {
        Assignment a = new Assignment();
        a.setResourceId(resourceId);
        a.setProjectId(projectId);
        a.setAssignedByUserId(assignedByUserId);
        a.setStartDate(startDate);
        a.setEndDate(endDate);
        a.setAllocationRate(allocationRate != null ? allocationRate : 100);
        return Optional.of(toMap(assignmentRepository.save(a)));
    }

    public Optional<Map<String, Object>> updateAssignment(Long id, Long resourceId, Long projectId, Long assignedByUserId,
                                                         java.time.LocalDate startDate, java.time.LocalDate endDate, Integer allocationRate) {
        return assignmentRepository.findById(id).map(a -> {
            if (resourceId != null) a.setResourceId(resourceId);
            if (projectId != null) a.setProjectId(projectId);
            if (assignedByUserId != null) a.setAssignedByUserId(assignedByUserId);
            if (startDate != null) a.setStartDate(startDate);
            if (endDate != null) a.setEndDate(endDate);
            if (allocationRate != null) a.setAllocationRate(allocationRate);
            return toMap(assignmentRepository.save(a));
        });
    }

    public boolean deleteAssignment(Long id) {
        if (!assignmentRepository.existsById(id)) return false;
        assignmentRepository.deleteById(id);
        return true;
    }

    private Map<String, Object> toMap(Assignment a) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", a.getId());
        m.put("resourceId", a.getResourceId());
        m.put("projectId", a.getProjectId());
        m.put("assignedByUserId", a.getAssignedByUserId());
        m.put("startDate", a.getStartDate() != null ? a.getStartDate().toString() : null);
        m.put("endDate", a.getEndDate() != null ? a.getEndDate().toString() : null);
        m.put("allocationRate", a.getAllocationRate() != null ? a.getAllocationRate() : 100);
        return m;
    }

    // --- TJM Grids ---
    public Map<String, Object> getTjmGrids() {
        Map<String, Object> grids = new HashMap<>();
        grids.put("profile", new HashMap<String, Object>());
        grids.put("level", new HashMap<String, Object>());
        for (TjmEntry e : tjmEntryRepository.findAll()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> sub = (Map<String, Object>) grids.computeIfAbsent(e.getGridType(), k -> new HashMap<String, Object>());
            sub.put(e.getRefId(), Map.of("value", e.getValue(), "date", e.getDate() != null ? e.getDate() : ""));
        }
        return grids;
    }

    public void setTjmModel(String tjmModel) {
        updateSettings(null, null, null, null, null, tjmModel);
    }

    public void setTjmProfile(String id, double value, String date) {
        TjmEntry.TjmEntryId pk = new TjmEntry.TjmEntryId("profile", id);
        TjmEntry e = tjmEntryRepository.findById(pk).orElseGet(() -> {
            TjmEntry ent = new TjmEntry();
            ent.setGridType("profile");
            ent.setRefId(id);
            ent.setValue(0.0);
            ent.setDate("");
            return ent;
        });
        e.setValue(value);
        e.setDate(date != null ? date : "");
        tjmEntryRepository.save(e);
    }

    public void setTjmLevel(String id, double value, String date) {
        TjmEntry.TjmEntryId pk = new TjmEntry.TjmEntryId("level", id);
        TjmEntry e = tjmEntryRepository.findById(pk).orElseGet(() -> {
            TjmEntry ent = new TjmEntry();
            ent.setGridType("level");
            ent.setRefId(id);
            ent.setValue(0.0);
            ent.setDate("");
            return ent;
        });
        e.setValue(value);
        e.setDate(date != null ? date : "");
        tjmEntryRepository.save(e);
    }

    // --- Export / Import / Reset ---
    public Map<String, Object> getAll() {
        Map<String, Object> out = new HashMap<>();
        out.put("profiles", getProfiles(null));
        out.put("levels", getLevels());
        out.put("tjmGrids", getTjmGrids());
        out.put("resources", getResources(null, null, null));
        out.put("clients", getClients(null));
        out.put("charges", getCharges(null, null));
        out.put("settings", getSettings());
        return out;
    }

    @Transactional
    public void importData(Map<String, Object> imported) {
        if (imported == null || imported.isEmpty()) return;
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> profiles = (List<Map<String, Object>>) imported.get("profiles");
            if (profiles != null) {
                profileRepository.deleteAll();
                for (Map<String, Object> m : profiles) {
                    Profile p = new Profile();
                    p.setName((String) m.get("name"));
                    p.setCode((String) m.get("code"));
                    p.setAvgSalary(toDouble(m.get("avgSalary"), 0));
                    profileRepository.save(p);
                }
            }
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> levels = (List<Map<String, Object>>) imported.get("levels");
            if (levels != null) {
                levelRepository.deleteAll();
                for (Map<String, Object> m : levels) {
                    Level l = new Level();
                    l.setNumber(((Number) m.get("number")).intValue());
                    l.setLabel((String) m.get("label"));
                    l.setAvgSalary(toDouble(m.get("avgSalary"), 0));
                    levelRepository.save(l);
                }
            }
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> clients = (List<Map<String, Object>>) imported.get("clients");
            if (clients != null) {
                clientRepository.deleteAll();
                for (Map<String, Object> m : clients) {
                    Client c = new Client();
                    c.setName((String) m.get("name"));
                    c.setCode((String) m.get("code"));
                    c.setDescription((String) m.get("description"));
                    String scope = (String) m.get("scope");
                    c.setScope("HORS_GROUPE".equals(scope) ? "HORS_GROUPE" : "GROUPE");
                    clientRepository.save(c);
                }
            }
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> resources = (List<Map<String, Object>>) imported.get("resources");
            if (resources != null) {
                resourceRepository.deleteAll();
                for (Map<String, Object> m : resources) {
                    Resource r = new Resource();
                    r.setType((String) m.get("type"));
                    r.setName((String) m.get("name"));
                    r.setProfileId(m.get("profileId") != null ? ((Number) m.get("profileId")).longValue() : null);
                    r.setLevelId(m.get("levelId") != null ? ((Number) m.get("levelId")).longValue() : null);
                    r.setEntity((String) m.get("entity"));
                    r.setClientId(m.get("clientId") != null ? ((Number) m.get("clientId")).longValue() : null);
                    r.setDepartment((String) m.get("department"));
                    r.setSalary(toDouble(m.get("salary"), 0));
                    r.setBonus(toDouble(m.get("bonus"), 0));
                    r.setStartDate((String) m.get("startDate"));
                    resourceRepository.save(r);
                }
            }
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> charges = (List<Map<String, Object>>) imported.get("charges");
            if (charges != null) {
                chargeRepository.deleteAll();
                for (Map<String, Object> m : charges) {
                    Charge c = new Charge();
                    c.setType((String) m.get("type"));
                    c.setClientId(m.get("clientId") != null ? ((Number) m.get("clientId")).longValue() : null);
                    c.setResourceId(m.get("resourceId") != null ? ((Number) m.get("resourceId")).longValue() : null);
                    c.setAmount(toDouble(m.get("amount"), 0));
                    c.setDate((String) m.get("date"));
                    c.setDescription((String) m.get("description"));
                    chargeRepository.save(c);
                }
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> settings = (Map<String, Object>) imported.get("settings");
            if (settings != null) {
                AppSettings s = appSettingsRepository.findById(1L).orElseGet(() -> { AppSettings def = new AppSettings(); def.setId(1L); return def; });
                s.setTjmModel((String) settings.get("tjmModel"));
                s.setMarginCgdim(toDouble(settings.get("marginCgdim"), 8));
                s.setMarginOutsourcing(toDouble(settings.get("marginOutsourcing"), 5));
                s.setMarginHorsGroupe(toDouble(settings.get("marginHorsGroupe"), 10));
                s.setProductiveDaysBudget(settings.get("productiveDaysBudget") != null ? ((Number) settings.get("productiveDaysBudget")).intValue() : 229);
                s.setExchangeRateBudget(toDouble(settings.get("exchangeRateBudget"), 10.8));
                if (settings.get("overhead") != null) {
                    try {
                        s.setOverheadJson(objectMapper.writeValueAsString(settings.get("overhead")));
                    } catch (Exception ignored) {}
                }
                appSettingsRepository.save(s);
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> tjmGrids = (Map<String, Object>) imported.get("tjmGrids");
            if (tjmGrids != null) {
                tjmEntryRepository.deleteAll();
                for (String gridType : List.of("profile", "level")) {
                    Object sub = tjmGrids.get(gridType);
                    if (sub instanceof Map) {
                        for (Map.Entry<String, Object> e : ((Map<String, Object>) sub).entrySet()) {
                            Object val = e.getValue();
                            if (val instanceof Map) {
                                Map<String, Object> entry = (Map<String, Object>) val;
                                TjmEntry te = new TjmEntry();
                                te.setGridType(gridType);
                                te.setRefId(e.getKey());
                                te.setValue(toDouble(entry.get("value"), 0));
                                te.setDate((String) entry.get("date"));
                                tjmEntryRepository.save(te);
                            }
                        }
                    }
                }
            }
        } catch (Exception ignored) {}
    }

    @Transactional
    public void reset() {
        tjmEntryRepository.deleteAll();
        chargeRepository.deleteAll();
        resourceRepository.deleteAll();
        clientRepository.deleteAll();
        levelRepository.deleteAll();
        profileRepository.deleteAll();
        appSettingsRepository.deleteAll();
        initDefaultSettings();
    }

    private static double toDouble(Object v, double def) {
        if (v == null) return def;
        if (v instanceof Number) return ((Number) v).doubleValue();
        try { return Double.parseDouble(v.toString()); } catch (Exception e) { return def; }
    }
}
