package com.localbet.group;

import com.localbet.user.User;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.random.RandomGenerator;

@Path("/groups")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GroupResource {

    @Inject
    JsonWebToken jwt;

    private UUID currentUserId() {
        return UUID.fromString(jwt.getSubject());
    }

    @GET
    public List<Group> myGroups() {
        return Group.findByUserId(currentUserId());
    }

    @POST
    @Transactional
    public Response create(Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            return Response.status(400).entity("{\"error\":\"Nome é obrigatório\"}").build();
        }

        User owner = User.findById(currentUserId());
        Group group = new Group();
        group.name = name;
        group.inviteCode = generateCode();
        group.owner = owner;
        group.persist();

        GroupMember member = new GroupMember();
        member.group = group;
        member.user = owner;
        member.role = "OWNER";
        member.persist();

        return Response.status(201).entity(group).build();
    }

    @POST
    @Path("/join")
    @Transactional
    public Response join(Map<String, String> body) {
        String inviteCode = body.get("inviteCode");
        Group group = Group.findByInviteCode(inviteCode)
                .orElseThrow(() -> new WebApplicationException(
                        Response.status(404).entity("{\"error\":\"Grupo não encontrado\"}").build()));

        UUID userId = currentUserId();
        boolean alreadyMember = GroupMember.count(
                "group.id = ?1 AND user.id = ?2", group.id, userId) > 0;

        if (alreadyMember) {
            return Response.status(409).entity("{\"error\":\"Você já é membro deste grupo\"}").build();
        }

        User user = User.findById(userId);
        GroupMember member = new GroupMember();
        member.group = group;
        member.user = user;
        member.role = "MEMBER";
        member.persist();

        return Response.ok(group).build();
    }

    @GET
    @Path("/{id}")
    public Response getGroup(@PathParam("id") UUID groupId) {
        Group g = Group.findById(groupId);
        if (g == null) return Response.status(404).build();
        return Response.ok(g).build();
    }

    @GET
    @Path("/{id}/members")
    public List<GroupMember> members(@PathParam("id") UUID groupId) {
        return GroupMember.list("group.id", groupId);
    }

    @GET
    @Path("/{id}/leaderboard")
    public List<LeaderboardEntry> leaderboard(
            @PathParam("id") UUID groupId,
            @QueryParam("championshipId") UUID championshipId,
            @QueryParam("standalone") @DefaultValue("false") boolean standalone) {

        String filter = "WHERE b.group.id = :groupId";
        if (championshipId != null) {
            filter += " AND b.match.championship.id = :champId";
        } else if (standalone) {
            filter += " AND b.match.championship IS NULL";
        }

        var query = com.localbet.bet.BetResult.getEntityManager()
            .createQuery(
                "SELECT b.user.id, b.user.name, SUM(br.points), " +
                "SUM(CASE WHEN br.isExact = true THEN 1 ELSE 0 END), " +
                "SUM(b.amount), SUM(br.winnings) " +
                "FROM BetResult br JOIN br.bet b " +
                filter +
                " GROUP BY b.user.id, b.user.name " +
                "ORDER BY SUM(br.points) DESC",
                Object[].class
            )
            .setParameter("groupId", groupId);

        if (championshipId != null) {
            query.setParameter("champId", championshipId);
        }

        return query.getResultList().stream()
            .map(r -> new LeaderboardEntry(
                r[0].toString(),
                (String) r[1],
                ((Number) r[2]).longValue(),
                ((Number) r[3]).longValue(),
                (java.math.BigDecimal) r[4],
                (java.math.BigDecimal) r[5]
            ))
            .toList();
    }

    private String generateCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder(8);
        RandomGenerator rng = RandomGenerator.getDefault();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(rng.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
