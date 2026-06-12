package com.localbet.sport;

import com.localbet.calculation.BetCalculationService;
import com.localbet.bet.BetResult;
import com.localbet.group.Group;
import com.localbet.group.GroupMember;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Path("/championships")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ChampionshipResource {

    @Inject
    JsonWebToken jwt;

    @Inject
    BetCalculationService calculationService;

    @GET
    @Path("/group/{groupId}")
    public List<Championship> byGroup(@PathParam("groupId") UUID groupId) {
        return Championship.findByGroupId(groupId);
    }

    @GET
    @Path("/{id}/rounds")
    public List<Round> rounds(@PathParam("id") UUID championshipId) {
        return Round.findByChampionshipId(championshipId);
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") UUID championshipId) {
        Championship championship = Championship.findById(championshipId);
        if (championship == null) {
            return Response.status(404).entity("{\"error\":\"Campeonato não encontrado\"}").build();
        }

        UUID userId = UUID.fromString(jwt.getSubject());
        boolean isOwner = GroupMember.count(
            "group.id = ?1 AND user.id = ?2 AND role = 'OWNER'",
            championship.group.id, userId) > 0;
        if (!isOwner) {
            return Response.status(403).entity("{\"error\":\"Apenas o dono do grupo pode remover campeonatos\"}").build();
        }

        List<UUID> matchIds = Match.getEntityManager()
            .createQuery("SELECT m.id FROM Match m WHERE m.championship.id = :championshipId", UUID.class)
            .setParameter("championshipId", championship.id)
            .getResultList();
        deleteMatchesByIds(matchIds);
        Round.delete("championship.id", championship.id);
        Championship.delete("id", championshipId);
        Championship.getEntityManager().flush();
        Championship.getEntityManager().clear();

        return Response.noContent().build();
    }

    @DELETE
    @Path("/{id}/rounds/{roundId}")
    @Transactional
    public Response deleteRound(@PathParam("id") UUID championshipId, @PathParam("roundId") UUID roundId) {
        Round round = Round.findById(roundId);
        if (round == null || !round.championship.id.equals(championshipId)) {
            return Response.status(404).entity("{\"error\":\"Rodada não encontrada\"}").build();
        }

        UUID userId = UUID.fromString(jwt.getSubject());
        boolean isOwner = GroupMember.count(
            "group.id = ?1 AND user.id = ?2 AND role = 'OWNER'",
            round.championship.group.id, userId) > 0;
        if (!isOwner) {
            return Response.status(403).entity("{\"error\":\"Apenas o dono do grupo pode remover rodadas\"}").build();
        }

        Championship championship = round.championship;
        boolean shouldRecalculate = "CHAMPIONSHIP".equals(championship.betScope) && "CLOSED".equals(championship.status);
        List<UUID> matchIds = Match.getEntityManager()
            .createQuery("SELECT m.id FROM Match m WHERE m.round.id = :roundId", UUID.class)
            .setParameter("roundId", round.id)
            .getResultList();
        deleteMatchesByIds(matchIds);

        Round.delete("id", roundId);
        Round.getEntityManager().flush();
        Round.getEntityManager().clear();

        if (shouldRecalculate) {
            Championship refreshedChampionship = Championship.findById(championshipId);
            if (refreshedChampionship != null) {
                calculationService.calculateChampionshipWinnings(refreshedChampionship);
            }
        }

        return Response.noContent().build();
    }

    private void deleteMatchesByIds(List<UUID> matchIds) {
        if (matchIds.isEmpty()) {
            return;
        }

        List<UUID> betIds = BetResult.getEntityManager()
            .createQuery("SELECT b.id FROM Bet b WHERE b.match.id IN :matchIds", UUID.class)
            .setParameter("matchIds", matchIds)
            .getResultList();
        if (!betIds.isEmpty()) {
            BetResult.delete("bet.id in ?1", betIds);
            com.localbet.bet.Bet.delete("id in ?1", betIds);
        }
        GroupMatch.delete("match.id in ?1", matchIds);
        Match.delete("id in ?1", matchIds);
    }

    @POST
    @Path("/{id}/rounds")
    @Transactional
    public Response createRound(@PathParam("id") UUID championshipId, CreateRoundRequest req) {
        Championship c = Championship.findById(championshipId);
        if (c == null) {
            return Response.status(404).entity("{\"error\":\"Campeonato não encontrado\"}").build();
        }
        Round round = new Round();
        round.championship = c;
        round.name = req.name;
        round.orderNum = req.orderNum;
        round.persist();
        return Response.status(201).entity(round).build();
    }

    @POST
    @Transactional
    public Response create(CreateChampionshipRequest req) {
        Sport sport = Sport.findById(req.sportId);
        if (sport == null) {
            return Response.status(404).entity("{\"error\":\"Esporte não encontrado\"}").build();
        }
        Group group = Group.findById(req.groupId);
        if (group == null) {
            return Response.status(404).entity("{\"error\":\"Grupo não encontrado\"}").build();
        }

        Championship c = new Championship();
        c.name = req.name;
        c.season = req.season;
        c.sport = sport;
        c.group = group;
        c.scoringMode = req.scoringMode != null ? req.scoringMode : "PROPORTIONAL";
        c.betScope = req.betScope != null ? req.betScope : "MATCH";
        c.defaultBetAmount = req.defaultBetAmount;
        c.persist();

        return Response.status(201).entity(c).build();
    }

    @POST
    @Path("/{id}/close")
    @Transactional
    public Response close(@PathParam("id") UUID championshipId) {
        Championship c = Championship.findById(championshipId);
        if (c == null) {
            return Response.status(404).entity("{\"error\":\"Campeonato não encontrado\"}").build();
        }
        if ("CLOSED".equals(c.status)) {
            return Response.status(400).entity("{\"error\":\"Campeonato já encerrado\"}").build();
        }

        UUID userId = UUID.fromString(jwt.getSubject());
        boolean isOwner = GroupMember.count("group.id = ?1 AND user.id = ?2 AND role = 'OWNER'",
                c.group.id, userId) > 0;
        if (!isOwner) {
            return Response.status(403).entity("{\"error\":\"Apenas o dono do grupo pode encerrar o campeonato\"}").build();
        }

        if ("CHAMPIONSHIP".equals(c.betScope)) {
            calculationService.calculateChampionshipWinnings(c);
        }

        c.status = "CLOSED";
        c.persist();

        return Response.ok(c).build();
    }

    public static class CreateRoundRequest {
        public String name;
        public Integer orderNum;
    }

    public static class CreateChampionshipRequest {
        public String name;
        public String season;
        public UUID sportId;
        public UUID groupId;
        public String scoringMode;
        public String betScope;
        public BigDecimal defaultBetAmount;
    }
}
