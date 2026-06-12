package com.localbet.sport;

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

@Path("/sports")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SportResource {

    @Inject
    JsonWebToken jwt;

    @GET
    public List<Sport> list() {
        return Sport.listAll();
    }

    @POST
    @Path("/matches")
    @Transactional
    public Response createMatch(CreateMatchRequest req) {
        Sport sport = Sport.findById(req.sportId);
        if (sport == null) {
            return Response.status(404).entity("{\"error\":\"Esporte não encontrado\"}").build();
        }

        com.localbet.user.User creator = com.localbet.user.User.findById(UUID.fromString(jwt.getSubject()));

        Match match = new Match();
        match.sport = sport;
        match.homeTeam = req.homeTeam;
        match.awayTeam = req.awayTeam;
        match.matchDate = req.matchDate;
        match.createdBy = creator;
        if (req.championshipId != null) {
            Championship championship = Championship.findById(req.championshipId);
            if (championship != null) {
                match.championship = championship;
            }
        }
        if (req.roundId != null) {
            Round round = Round.findById(req.roundId);
            if (round != null) {
                match.round = round;
            }
        }
        match.persist();

        if (req.groupId != null) {
            com.localbet.group.Group group = com.localbet.group.Group.findById(req.groupId);
            if (group != null) {
                GroupMatch gm = new GroupMatch();
                gm.group = group;
                gm.match = match;
                gm.persist();
            }
        }

        return Response.status(201).entity(match).build();
    }

    @GET
    @Path("/matches/group/{groupId}")
    public List<Match> matchesByGroup(@PathParam("groupId") UUID groupId) {
        return Match.find(
            "SELECT m FROM Match m JOIN GroupMatch gm ON gm.match.id = m.id WHERE gm.group.id = ?1",
            groupId
        ).list();
    }

    public static class CreateMatchRequest {
        public UUID sportId;
        public UUID groupId;
        public String homeTeam;
        public String awayTeam;
        public java.time.LocalDateTime matchDate;
        public UUID championshipId;
        public UUID roundId;
    }
}
