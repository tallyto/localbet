package com.localbet.activity;

import java.time.LocalDateTime;

public class ActivityEventDto {
    public String id;
    public String groupId;
    public String groupName;
    public String targetUserId;
    public String type;
    public String title;
    public String description;
    public String tone;
    public LocalDateTime createdAt;

    public ActivityEventDto(ActivityEvent event) {
        this.id = event.id.toString();
        this.groupId = event.group.id.toString();
        this.groupName = event.group.name;
        this.targetUserId = event.targetUser != null ? event.targetUser.id.toString() : null;
        this.type = event.type;
        this.title = event.title;
        this.description = event.description;
        this.tone = event.tone;
        this.createdAt = event.createdAt;
    }
}
