package com.localbet.sport;

import com.localbet.calculation.BetCalculationService;
import com.localbet.group.GroupMember;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Path("/matches")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MatchResource {

    @Inject
    BetCalculationService calculationService;

    @Inject
    JsonWebToken jwt;

    @POST
    @Path("/{id}/score")
    @Transactional
    public Response setScore(@PathParam("id") UUID matchId, Map<String, Integer> body) {
        Match match = Match.findById(matchId);
        if (match == null) {
            return Response.status(404).entity("{\"error\":\"Partida não encontrada\"}").build();
        }
        if ("FINISHED".equals(match.status)) {
            return Response.status(400).entity("{\"error\":\"Placar já registrado\"}").build();
        }

        UUID currentUserId = UUID.fromString(jwt.getSubject());

        // Verificar se o usuário é dono de algum grupo que contém esta partida
        List<GroupMatch> groupMatches = GroupMatch.list("match.id", matchId);
        boolean isOwner = groupMatches.stream().anyMatch(gm ->
            GroupMember.count("group.id = ?1 AND user.id = ?2 AND role = 'OWNER'",
                gm.group.id, currentUserId) > 0
        );

        if (!isOwner) {
            return Response.status(403).entity("{\"error\":\"Apenas o criador do grupo pode registrar o placar\"}").build();
        }

        Integer homeScore = body.get("homeScore");
        Integer awayScore = body.get("awayScore");
        if (homeScore == null || awayScore == null || homeScore < 0 || awayScore < 0) {
            return Response.status(400).entity("{\"error\":\"Placar inválido\"}").build();
        }

        match.homeScore = homeScore;
        match.awayScore = awayScore;
        match.status = "FINISHED";
        match.persist();

        calculationService.calculateForMatch(match);

        return Response.ok(match).build();
    }

    @PUT
    @Path("/{id}/score")
    @Transactional
    public Response updateScore(@PathParam("id") UUID matchId, Map<String, Integer> body) {
        Match match = Match.findById(matchId);
        if (match == null) {
            return Response.status(404).entity("{\"error\":\"Partida não encontrada\"}").build();
        }

        UUID currentUserId = UUID.fromString(jwt.getSubject());
        List<GroupMatch> groupMatches = GroupMatch.list("match.id", matchId);
        boolean isOwner = groupMatches.stream().anyMatch(gm ->
            GroupMember.count("group.id = ?1 AND user.id = ?2 AND role = 'OWNER'",
                gm.group.id, currentUserId) > 0
        );
        if (!isOwner) {
            return Response.status(403).entity("{\"error\":\"Apenas o criador do grupo pode editar o placar\"}").build();
        }

        Integer homeScore = body.get("homeScore");
        Integer awayScore = body.get("awayScore");
        if (homeScore == null || awayScore == null || homeScore < 0 || awayScore < 0) {
            return Response.status(400).entity("{\"error\":\"Placar inválido\"}").build();
        }

        match.homeScore = homeScore;
        match.awayScore = awayScore;
        match.status = "FINISHED";
        match.persist();

        // Recalcular: deletar resultados anteriores e recalcular
        com.localbet.bet.BetResult.delete("bet.match.id", matchId);
        calculationService.calculateForMatch(match);

        return Response.ok(match).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deleteMatch(@PathParam("id") UUID matchId) {
        Match match = Match.findById(matchId);
        if (match == null) {
            return Response.status(404).entity("{\"error\":\"Partida não encontrada\"}").build();
        }

        UUID currentUserId = UUID.fromString(jwt.getSubject());
        List<GroupMatch> groupMatches = GroupMatch.list("match.id", matchId);
        boolean isOwner = groupMatches.stream().anyMatch(gm ->
            GroupMember.count("group.id = ?1 AND user.id = ?2 AND role = 'OWNER'",
                gm.group.id, currentUserId) > 0
        );
        if (!isOwner) {
            return Response.status(403).entity("{\"error\":\"Apenas o criador do grupo pode excluir partidas\"}").build();
        }

        // Deletar dependências em cascata
        com.localbet.bet.BetResult.delete("bet.match.id", matchId);
        com.localbet.bet.Bet.delete("match.id", matchId);
        GroupMatch.delete("match.id", matchId);
        match.delete();

        return Response.noContent().build();
    }

    @GET
    @Path("/{id}")
    public Response getMatch(@PathParam("id") UUID matchId) {
        Match match = Match.findById(matchId);
        if (match == null) {
            return Response.status(404).entity("{\"error\":\"Partida não encontrada\"}").build();
        }
        return Response.ok(match).build();
    }
}
