package com.cgdim.connector.sso;

import java.util.Optional;

/**
 * Connecteur SSO agnostique : valide un token ou des identifiants SSO et retourne les infos utilisateur.
 * Implémentations possibles : LDAP, Azure AD, Okta, SAML, etc.
 */
public interface SSOConnector {

    /**
     * Valide un token SSO (Bearer token, cookie, etc.) et retourne les infos utilisateur si valide.
     *
     * @param token token SSO (format dépend de l'implémentation)
     * @return infos utilisateur ou empty si token invalide / non SSO
     */
    Optional<SSOUserInfo> validateToken(String token);

    /**
     * Indique si le connecteur est actif (SSO configuré) ou en mode stub.
     */
    default boolean isEnabled() {
        return false;
    }
}
