package com.localbet.sport;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class GroupMatchId implements Serializable {
    public UUID group;
    public UUID match;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GroupMatchId)) return false;
        GroupMatchId that = (GroupMatchId) o;
        return Objects.equals(group, that.group) && Objects.equals(match, that.match);
    }

    @Override
    public int hashCode() {
        return Objects.hash(group, match);
    }
}
