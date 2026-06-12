CREATE TABLE championships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    season VARCHAR(20),
    sport_id UUID NOT NULL REFERENCES sports(id),
    group_id UUID NOT NULL REFERENCES groups(id),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE matches ADD COLUMN championship_id UUID REFERENCES championships(id);
ALTER TABLE matches ADD COLUMN round VARCHAR(50);
