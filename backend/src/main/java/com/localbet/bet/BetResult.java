package com.localbet.bet;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "bet_results")
public class BetResult extends PanacheEntityBase {

    @Id
    @Column(columnDefinition = "uuid")
    public UUID id = UUID.randomUUID();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToOne
    @JoinColumn(name = "bet_id", nullable = false, unique = true)
    public Bet bet;

    @Column(nullable = false)
    public int points;

    @Column(name = "is_exact", nullable = false)
    public boolean isExact;

    @Column(nullable = false, precision = 10, scale = 2)
    public java.math.BigDecimal winnings = java.math.BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "calculated_at", nullable = false, updatable = false)
    public LocalDateTime calculatedAt;
}
