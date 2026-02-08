package com.cgdim.connector.sirh;

import java.time.LocalDate;

/**
 * Enregistrement d'absence retourné par un connecteur SIRH.
 * API agnostique : l'implémentation concrète dépend du SIRH (API REST, fichier, etc.).
 */
public record AbsenceRecord(
        String resourceIdOrMatricule,
        LocalDate dateFrom,
        LocalDate dateTo,
        String type,
        String status
) {}
