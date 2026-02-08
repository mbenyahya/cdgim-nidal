package com.cgdim.connector.sirh;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Connecteur SIRH stub : aucune intégration SIRH configurée. Retourne une liste vide.
 * Remplacer par une implémentation réelle (API SIRH, import fichier, etc.) en fournissant un bean SIRHConnector.
 */
@Component
@ConditionalOnMissingBean(SIRHConnector.class)
public class StubSIRHConnector implements SIRHConnector {

    @Override
    public List<AbsenceRecord> fetchValidatedAbsences(LocalDate from, LocalDate to) {
        return List.of();
    }

    @Override
    public boolean isEnabled() {
        return false;
    }
}
