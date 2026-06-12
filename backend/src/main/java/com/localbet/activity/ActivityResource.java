package com.localbet.activity;

import com.localbet.group.GroupMember;
import io.quarkus.panache.common.Page;
import io.quarkus.security.Authenticated;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import jakarta.inject.Inject;
import java.util.List;
import java.util.UUID;

@Path("/activity")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
public class ActivityResource {

    private static final String GROUP_MEMBER_QUERY = "group.id = ?1 AND user.id = ?2";

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/groups/{groupId}")
    @Transactional
    public List<ActivityEventDto> groupActivity(@PathParam("groupId") UUID groupId) {
        requireMember(groupId);
        return ActivityEvent.<ActivityEvent>find(
                "group.id = ?1 ORDER BY createdAt DESC",
                groupId
            )
            .page(Page.of(0, 50))
            .list()
            .stream()
            .map(ActivityEventDto::new)
            .toList();
    }

    @GET
    @Path("/notifications")
    @Transactional
    public List<ActivityEventDto> notifications() {
        UUID userId = currentUserId();
        return ActivityEvent.getEntityManager()
            .createQuery(
                "SELECT e FROM ActivityEvent e JOIN GroupMember gm ON gm.group.id = e.group.id " +
                "WHERE gm.user.id = :userId AND (e.targetUser IS NULL OR e.targetUser.id = :userId) " +
                "ORDER BY e.createdAt DESC",
                ActivityEvent.class
            )
            .setParameter("userId", userId)
            .setMaxResults(50)
            .getResultList()
            .stream()
            .map(ActivityEventDto::new)
            .toList();
    }

    private UUID currentUserId() {
        return UUID.fromString(jwt.getSubject());
    }

    private void requireMember(UUID groupId) {
        if (GroupMember.count(GROUP_MEMBER_QUERY, groupId, currentUserId()) == 0) {
            throw new WebApplicationException(
                Response.status(403).entity("{\"error\":\"Você não participa deste grupo\"}").build()
            );
        }
    }
}
