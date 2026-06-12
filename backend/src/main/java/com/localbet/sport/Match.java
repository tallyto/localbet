package com.localbet.sport;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.localbet.user.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "matches")
public class Match extends PanacheEntityBase {

    @Id
    @Column(columnDefinition = "uuid")
    public UUID id = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sport_id", nullable = false)
    public Sport sport;

    @Column(name = "home_team", nullable = false, length = 100)
    public String homeTeam;

    @Column(name = "away_team", nullable = false, length = 100)
    public String awayTeam;

    @Column(name = "match_date", nullable = false)
    public LocalDateTime matchDate;

    @Column(nullable = false, length = 20)
    public String status = "SCHEDULED";

    @Column(name = "home_score")
    public Integer homeScore;

    @Column(name = "away_score")
    public Integer awayScore;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    public User createdBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "championship_id")
    public Championship championship;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "round_id")
    public Round round;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;
}
