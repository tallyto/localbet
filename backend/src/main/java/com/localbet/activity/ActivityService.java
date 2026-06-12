package com.localbet.activity;

import com.localbet.bet.Bet;
import com.localbet.bet.BetResult;
import com.localbet.group.Group;
import com.localbet.sport.GroupMatch;
import com.localbet.sport.Match;
import com.localbet.user.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ActivityService {

    @Transactional
    public void recordMatchFinished(Match match, boolean correction) {
        deleteForMatch(match.id);

        List<GroupMatch> groupMatches = GroupMatch.list("match.id", match.id);
        for (GroupMatch groupMatch : groupMatches) {
            Group group = groupMatch.group;
            create(
                group,
                null,
                correction ? "MATCH_SCORE_UPDATED" : "MATCH_FINISHED",
                match.homeTeam + " " + match.homeScore + " x " + match.awayScore + " " + match.awayTeam,
                matchDescription(match, correction),
                correction ? "warning" : "info",
                "MATCH",
                match.id.toString()
            );

            List<Bet> exactBets = Bet.list(
                "group.id = ?1 AND match.id = ?2 AND result.isExact = true",
                group.id,
                match.id
            );
            for (Bet bet : exactBets) {
                create(
                    group,
                    bet.user,
                    "EXACT_SCORE",
                    bet.user.name + " acertou o placar exato",
                    match.homeTeam + " " + match.homeScore + " x " + match.awayScore + " " + match.awayTeam,
                    "success",
                    "MATCH",
                    match.id.toString()
                );
            }

            LeaderSnapshot leader = leaderForGroup(group.id);
            if (leader != null) {
                create(
                    group,
                    leader.user(),
                    "LEADERBOARD_LEADER",
                    leader.user().name + " lidera o ranking",
                    leader.points() + " pontos acumulados no grupo.",
                    "success",
                    "MATCH",
                    match.id.toString()
                );
            }
        }
    }

    @Transactional
    public void deleteForMatch(UUID matchId) {
        ActivityEvent.delete("sourceType = ?1 AND sourceId = ?2", "MATCH", matchId.toString());
    }

    private void create(Group group, User targetUser, String type, String title, String description,
                        String tone, String sourceType, String sourceId) {
        ActivityEvent event = new ActivityEvent();
        event.group = group;
        event.targetUser = targetUser;
        event.type = type;
        event.title = title;
        event.description = description;
        event.tone = tone;
        event.sourceType = sourceType;
        event.sourceId = sourceId;
        event.persist();
    }

    private String matchDescription(Match match, boolean correction) {
        String prefix = correction ? "Placar corrigido" : "Partida finalizada";
        if (match.championship == null) return prefix + " em partida avulsa.";
        if (match.round == null) return prefix + " em " + match.championship.name + ".";
        return prefix + " em " + match.championship.name + " · " + match.round.name + ".";
    }

    private LeaderSnapshot leaderForGroup(UUID groupId) {
        List<Object[]> rows = BetResult.getEntityManager()
            .createQuery(
                "SELECT b.user, SUM(br.points) " +
                "FROM BetResult br JOIN br.bet b " +
                "WHERE b.group.id = :groupId " +
                "GROUP BY b.user " +
                "ORDER BY SUM(br.points) DESC",
                Object[].class
            )
            .setParameter("groupId", groupId)
            .setMaxResults(1)
            .getResultList();
        if (rows.isEmpty()) return null;
        return new LeaderSnapshot((User) rows.get(0)[0], ((Number) rows.get(0)[1]).longValue());
    }

    private record LeaderSnapshot(User user, long points) {}
}
