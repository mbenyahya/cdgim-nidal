package com.cgdim.connector.sirh;

import java.time.LocalDate;
import java.util.List;

/**
 * Connecteur SIRH agnostique : récupère les jours d'absence validés.
 * Implémentations possibles : API REST du SIRH, import fichier CSV/Excel, etc.
 */
public interface SIRHConnector {

    /**
     * Récupère les absences validées sur une période (tous collaborateurs ou filtré).
     *
     * @param from date début
     * @param to   date fin
     * @return liste des enregistrements d'absence validés
     */
    List<AbsenceRecord> fetchValidatedAbsences(LocalDate from, LocalDate to);

    /**
     * Récupère les absences validées pour une ressource (matricule ou id) sur une période.
     */
    default List<AbsenceRecord> fetchValidatedAbsencesForResource(String resourceIdOrMatricule, LocalDate from, LocalDate to) {
        return fetchValidatedAbsences(from, to).stream()
                .filter(a -> resourceIdOrMatricule.equals(a.resourceIdOrMatricule()))
                .toList();
    }

    /**
     * Indique si le connecteur est actif (SIRH configuré) ou en mode stub.
     */
    default boolean isEnabled() {
        return false;
    }
}
