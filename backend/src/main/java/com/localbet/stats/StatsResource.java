package com.localbet.stats;

import com.localbet.group.Group;
import com.localbet.sport.Championship;
import com.localbet.sport.Match;
import com.localbet.user.User;
import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/stats")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
public class StatsResource {

    @GET
    public Stats get() {
        return new Stats(
            User.count(),
            Group.count(),
            Championship.count(),
            Match.count()
        );
    }

    public record Stats(long users, long groups, long championships, long matches) {}
}
