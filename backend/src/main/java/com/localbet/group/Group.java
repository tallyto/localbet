package com.localbet.group;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.localbet.user.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Entity
@Table(name = "groups")
public class Group extends PanacheEntityBase {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.RANDOM)
    @Column(columnDefinition = "uuid")
    public UUID id;

    @Column(nullable = false, length = 100)
    public String name;

    @Column(name = "invite_code", nullable = false, unique = true, length = 20)
    public String inviteCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    public User owner;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @JsonProperty("ownerId")
    public UUID getOwnerId() {
        return owner != null ? owner.id : null;
    }

    public static Optional<Group> findByInviteCode(String code) {
        return find("inviteCode", code).firstResultOptional();
    }

    public static List<Group> findByUserId(UUID userId) {
        return find("SELECT g FROM Group g JOIN GroupMember gm ON gm.group.id = g.id WHERE gm.user.id = ?1", userId).list();
    }
}
