package com.localbet.auth;

import java.util.UUID;

public class AuthResponse {
    public String token;
    public UUID userId;
    public String name;
    public String email;

    public AuthResponse(String token, UUID userId, String name, String email) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
    }
}
