package com.localbet.bet;

import com.localbet.calculation.BetCalculationService;
import com.localbet.group.Group;
import com.localbet.sport.Match;
import com.localbet.user.User;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Path("/bets")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class BetResource {

    @Inject
    JsonWebToken jwt;

    @Inject
    BetCalculationService calculationService;

    @POST
    @Transactional
    public Response place(PlaceBetRequest req) {
        UUID userId = UUID.fromString(jwt.getSubject());

        Match match = Match.findById(req.matchId);
        if (match == null) {
            return Response.status(404).entity("{\"error\":\"Partida não encontrada\"}").build();
        }
        if ("FINISHED".equals(match.status) || "IN_PROGRESS".equals(match.status)) {
            return Response.status(400).entity("{\"error\":\"Partida já encerrada\"}").build();
        }
        if (LocalDateTime.now().isAfter(match.matchDate)) {
            return Response.status(400).entity("{\"error\":\"Apostas encerradas — a partida já começou\"}").build();
        }

        boolean alreadyBet = Bet.count(
            "group.id = ?1 AND match.id = ?2 AND user.id = ?3",
            req.groupId, req.matchId, userId) > 0;

        if (alreadyBet) {
            return Response.status(409).entity("{\"error\":\"Você já apostou nesta partida\"}").build();
        }

        Group group = Group.findById(req.groupId);
        User user = User.findById(userId);

        Bet bet = new Bet();
        bet.group = group;
        bet.match = match;
        bet.user = user;
        bet.homeScore = req.homeScore;
        bet.awayScore = req.awayScore;
        bet.amount = req.amount != null ? req.amount : java.math.BigDecimal.ZERO;
        bet.persist();

        return Response.status(201).entity(bet).build();
    }

    @GET
    @Path("/group/{groupId}/match/{matchId}")
    @Transactional
    public List<Bet> betsByGroupAndMatch(
            @PathParam("groupId") UUID groupId,
            @PathParam("matchId") UUID matchId) {
        Match match = Match.findById(matchId);
        if (match != null
                && match.championship != null
                && "CHAMPIONSHIP".equals(match.championship.betScope)
                && "CLOSED".equals(match.championship.status)) {
            calculationService.calculateChampionshipWinnings(match.championship);
        }

        return Bet.findByGroupAndMatch(groupId, matchId);
    }

    @GET
    @Path("/group/{groupId}/match/{matchId}/results")
    public List<BetResult> betResultsByGroupAndMatch(
            @PathParam("groupId") UUID groupId,
            @PathParam("matchId") UUID matchId) {
        return BetResult.list(
            "SELECT br FROM BetResult br JOIN br.bet b WHERE b.group.id = ?1 AND b.match.id = ?2",
            groupId, matchId
        );
    }

    public static class PlaceBetRequest {
        public UUID groupId;
        public UUID matchId;
        public int homeScore;
        public int awayScore;
        public java.math.BigDecimal amount;
    }
}
