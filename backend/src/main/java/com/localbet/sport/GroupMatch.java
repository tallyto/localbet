package com.localbet.sport;

import com.localbet.group.Group;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

@Entity
@Table(name = "group_matches")
@IdClass(GroupMatchId.class)
public class GroupMatch extends PanacheEntityBase {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    public Group group;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id")
    public Match match;
}
