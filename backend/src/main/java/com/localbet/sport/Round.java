package com.localbet.sport;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rounds")
public class Round extends PanacheEntityBase {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.RANDOM)
    @Column(columnDefinition = "uuid")
    public UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "championship_id", nullable = false)
    public Championship championship;

    @Column(nullable = false, length = 100)
    public String name;

    @Column(name = "order_num")
    public Integer orderNum;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    public static List<Round> findByChampionshipId(UUID championshipId) {
        return getEntityManager()
            .createQuery(
                "SELECT r FROM Round r WHERE r.championship.id = :cid ORDER BY COALESCE(r.orderNum, 9999), r.createdAt",
                Round.class)
            .setParameter("cid", championshipId)
            .getResultList();
    }
}
