package com.cgdim.connector.sso;

import java.util.Optional;

/**
 * Informations utilisateur retournées par un connecteur SSO (annuaier entreprise, OAuth2, SAML, etc.).
 * API agnostique : l'implémentation concrète dépend du fournisseur (LDAP, Azure AD, Okta, etc.).
 */
public record SSOUserInfo(
        String username,
        String email,
        String enterpriseId,
        String externalId
) {
    public Optional<String> getEmail() { return Optional.ofNullable(email); }
    public Optional<String> getEnterpriseId() { return Optional.ofNullable(enterpriseId); }
    public Optional<String> getExternalId() { return Optional.ofNullable(externalId); }
}
