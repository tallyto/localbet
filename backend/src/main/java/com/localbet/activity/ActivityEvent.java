package com.localbet.activity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.localbet.group.Group;
import com.localbet.user.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "activity_events")
public class ActivityEvent extends PanacheEntityBase {

    @Id
    @Column(columnDefinition = "uuid")
    public UUID id = UUID.randomUUID();

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    public Group group;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id")
    public User targetUser;

    @Column(nullable = false, length = 40)
    public String type;

    @Column(nullable = false, length = 160)
    public String title;

    @Column(nullable = false, length = 500)
    public String description;

    @Column(nullable = false, length = 20)
    public String tone = "info";

    @Column(name = "source_type", length = 40)
    public String sourceType;

    @Column(name = "source_id", length = 80)
    public String sourceId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;
}
