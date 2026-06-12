package com.localbet.auth;

import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import java.util.Set;
import java.util.UUID;

@ApplicationScoped
public class TokenService {

    @ConfigProperty(name = "smallrye.jwt.new-token.issuer", defaultValue = "https://localbet.app")
    String issuer;

    public String generateToken(UUID userId, String email) {
        return Jwt.issuer(issuer)
                .subject(userId.toString())
                .upn(email)
                .groups(Set.of("user"))
                .claim("email", email)
                .sign();
    }
}
