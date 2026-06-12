package com.localbet.bet;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.localbet.group.Group;
import com.localbet.sport.Match;
import com.localbet.user.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "bets")
public class Bet extends PanacheEntityBase {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.RANDOM)
    @Column(columnDefinition = "uuid")
    public UUID id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    public Group group;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    public Match match;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Column(name = "home_score", nullable = false)
    public int homeScore;

    @Column(name = "away_score", nullable = false)
    public int awayScore;

    @Column(nullable = false, precision = 10, scale = 2)
    public java.math.BigDecimal amount = java.math.BigDecimal.ZERO;

    @OneToOne(mappedBy = "bet", fetch = FetchType.EAGER)
    public BetResult result;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    public static List<Bet> findByGroupAndMatch(UUID groupId, UUID matchId) {
        return list("group.id = ?1 AND match.id = ?2", groupId, matchId);
    }

    public static List<Bet> findByMatchId(UUID matchId) {
        return list("match.id", matchId);
    }
}
