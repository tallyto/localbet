package com.localbet.group;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class GroupMemberId implements Serializable {
    public UUID group;
    public UUID user;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GroupMemberId)) return false;
        GroupMemberId that = (GroupMemberId) o;
        return Objects.equals(group, that.group) && Objects.equals(user, that.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(group, user);
    }
}
