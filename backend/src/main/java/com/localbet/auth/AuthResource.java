package com.localbet.auth;

import com.localbet.bet.Bet;
import com.localbet.bet.BetResult;
import com.localbet.group.Group;
import com.localbet.group.GroupMember;
import com.localbet.user.User;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    TokenService tokenService;

    @Inject
    JsonWebToken jwt;

    @POST
    @Path("/register")
    @Transactional
    public Response register(@Valid AuthRequest.Register req) {
        if (!Boolean.TRUE.equals(req.acceptedTerms)) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Você precisa confirmar que leu e aceita os termos de uso.\"}")
                    .build();
        }

        if (User.findByEmail(req.email).isPresent()) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\":\"Email já cadastrado\"}")
                    .build();
        }

        User user = new User();
        user.name = req.name;
        user.email = req.email;
        user.passwordHash = BcryptUtil.bcryptHash(req.password);
        user.acceptedTermsAt = LocalDateTime.now();
        user.persist();

        String token = tokenService.generateToken(user.id, user.email);
        return Response.status(Response.Status.CREATED)
                .entity(new AuthResponse(token, user.id, user.name, user.email))
                .build();
    }

    @DELETE
    @Path("/me")
    @Authenticated
    @Transactional
    public Response deleteMe() {
        UUID userId = UUID.fromString(jwt.getSubject());
        User user = User.findById(userId);
        if (user == null) return Response.status(404).build();

        long ownedGroups = Group.count("owner.id = ?1", userId);
        if (ownedGroups > 0) {
            return Response.status(400)
                .entity("{\"error\":\"Você é dono de " + ownedGroups + " grupo(s). Exclua-os antes de apagar sua conta.\"}")
                .build();
        }

        // Delete bet_results for user's bets, then bets, then memberships
        List<Bet> userBets = Bet.list("user.id", userId);
        for (Bet b : userBets) {
            BetResult.delete("bet.id", b.id);
        }
        Bet.delete("user.id", userId);
        GroupMember.delete("user.id", userId);
        user.delete();

        return Response.noContent().build();
    }

    @POST
    @Path("/login")
    public Response login(@Valid AuthRequest.Login req) {
        User user = User.findByEmail(req.email)
                .orElseThrow(() -> new WebApplicationException(
                        Response.status(Response.Status.UNAUTHORIZED)
                                .entity("{\"error\":\"Credenciais inválidas\"}")
                                .build()));

        if (!BcryptUtil.matches(req.password, user.passwordHash)) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Credenciais inválidas\"}")
                    .build();
        }

        String token = tokenService.generateToken(user.id, user.email);
        return Response.ok(new AuthResponse(token, user.id, user.name, user.email)).build();
    }
}
