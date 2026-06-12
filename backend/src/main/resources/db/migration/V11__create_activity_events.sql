CREATE TABLE activity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL,
    title VARCHAR(160) NOT NULL,
    description VARCHAR(500) NOT NULL,
    tone VARCHAR(20) NOT NULL DEFAULT 'info',
    source_type VARCHAR(40),
    source_id VARCHAR(80),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_events_group_created ON activity_events(group_id, created_at DESC);
CREATE INDEX idx_activity_events_target_created ON activity_events(target_user_id, created_at DESC);
CREATE INDEX idx_activity_events_source ON activity_events(source_type, source_id);
