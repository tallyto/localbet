CREATE TABLE rounds (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    championship_id UUID NOT NULL REFERENCES championships(id),
    name         VARCHAR(100) NOT NULL,
    order_num    INTEGER,
    created_at   TIMESTAMP NOT NULL DEFAULT now()
);

-- Migra rodadas existentes (strings) para entidades Round
INSERT INTO rounds (championship_id, name)
SELECT DISTINCT championship_id, round
FROM matches
WHERE championship_id IS NOT NULL
  AND round IS NOT NULL
  AND round <> '';

-- Associa as partidas existentes às novas entidades Round
ALTER TABLE matches ADD COLUMN round_id UUID REFERENCES rounds(id);

UPDATE matches m
SET round_id = r.id
FROM rounds r
WHERE r.championship_id = m.championship_id
  AND r.name = m.round;

-- Remove a coluna string antiga
ALTER TABLE matches DROP COLUMN round;
