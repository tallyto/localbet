package com.localbet.auth;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AuthRequest {

    public static class Register {
        @NotBlank
        @Size(min = 2, max = 100)
        public String name;

        @NotBlank
        @Email
        public String email;

        @NotBlank
        @Size(min = 6)
        public String password;

        @NotNull
        @AssertTrue
        public Boolean acceptedTerms;
    }

    public static class Login {
        @NotBlank
        @Email
        public String email;

        @NotBlank
        public String password;
    }

    public static class UpdateProfile {
        @Size(min = 2, max = 100)
        public String name;

        public String currentPassword;

        @Size(min = 6)
        public String newPassword;
    }
}
