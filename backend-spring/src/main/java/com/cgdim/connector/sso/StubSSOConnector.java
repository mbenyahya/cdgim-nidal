package com.cgdim.connector.sso;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Connecteur SSO stub : aucun SSO configuré. L'authentification se fait par login/mot de passe en base.
 * Remplacer par une implémentation réelle (LDAP, Azure AD, etc.) en fournissant un bean SSOConnector.
 */
@Component
@ConditionalOnMissingBean(SSOConnector.class)
public class StubSSOConnector implements SSOConnector {

    @Override
    public Optional<SSOUserInfo> validateToken(String token) {
        return Optional.empty();
    }

    @Override
    public boolean isEnabled() {
        return false;
    }
}
