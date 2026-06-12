CREATE TABLE bet_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bet_id UUID NOT NULL REFERENCES bets(id) UNIQUE,
    points INTEGER NOT NULL DEFAULT 0,
    is_exact BOOLEAN NOT NULL DEFAULT false,
    calculated_at TIMESTAMP NOT NULL DEFAULT now()
);
