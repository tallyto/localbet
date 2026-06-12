package com.localbet.sport;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.localbet.group.Group;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "championships")
public class Championship extends PanacheEntityBase {

    @Id
    @Column(columnDefinition = "uuid")
    public UUID id = UUID.randomUUID();

    @Column(nullable = false, length = 100)
    public String name;

    @Column(length = 20)
    public String season;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sport_id", nullable = false)
    public Sport sport;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    public Group group;

    /** PROPORTIONAL ou EXACT_ONLY */
    @Column(name = "scoring_mode", nullable = false, length = 20)
    public String scoringMode = "PROPORTIONAL";

    /** MATCH (pool por jogo) ou CHAMPIONSHIP (pool acumulado, distribuído no encerramento) */
    @Column(name = "bet_scope", nullable = false, length = 20)
    public String betScope = "MATCH";

    /** Valor padrão sugerido por aposta */
    @Column(name = "default_bet_amount", precision = 10, scale = 2)
    public BigDecimal defaultBetAmount;

    /** ACTIVE ou CLOSED */
    @Column(nullable = false, length = 20)
    public String status = "ACTIVE";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    public static List<Championship> findByGroupId(UUID groupId) {
        return list("group.id", groupId);
    }
}
