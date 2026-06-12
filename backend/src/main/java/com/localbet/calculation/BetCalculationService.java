package com.localbet.calculation;

import com.localbet.bet.Bet;
import com.localbet.bet.BetResult;
import com.localbet.sport.Championship;
import com.localbet.sport.Match;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class BetCalculationService {

    @Transactional
    public void calculateForMatch(Match match) {
        List<Bet> bets = Bet.getEntityManager()
            .createQuery("SELECT b FROM Bet b JOIN FETCH b.group WHERE b.match.id = :matchId", Bet.class)
            .setParameter("matchId", match.id)
            .getResultList();

        Championship champ = match.championship;
        String scoringMode = champ != null && champ.scoringMode != null ? champ.scoringMode : "PROPORTIONAL";
        boolean deferToChampionship = champ != null && "CHAMPIONSHIP".equals(champ.betScope);

        Map<UUID, List<Bet>> betsByGroup = bets.stream()
            .collect(Collectors.groupingBy(b -> b.group.id));

        for (List<Bet> groupBets : betsByGroup.values()) {
            List<Bet> pending = groupBets.stream()
                .filter(b -> BetResult.count("bet.id", b.id) == 0)
                .toList();
            if (pending.isEmpty()) continue;

            BigDecimal totalPool = pending.stream()
                .map(b -> b.amount != null ? b.amount : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            for (Bet bet : pending) {
                boolean isExact = (bet.homeScore == match.homeScore && bet.awayScore == match.awayScore);
                int rawPoints = calculatePoints(bet.homeScore, bet.awayScore, match.homeScore, match.awayScore);
                // EXACT_ONLY: somente o acerto exato vale pontos
                int points = "EXACT_ONLY".equals(scoringMode) ? (isExact ? 10 : 0) : rawPoints;

                BetResult result = new BetResult();
                result.bet = bet;
                result.points = points;
                result.isExact = isExact;
                result.winnings = BigDecimal.ZERO;
                result.persist();
            }

            // Winnings diferidos: serão calculados ao encerrar o campeonato
            if (deferToChampionship) continue;

            distributeWinnings(pending, totalPool, scoringMode, match.homeScore, match.awayScore);
        }

        if (deferToChampionship && "CLOSED".equals(champ.status)) {
            calculateChampionshipWinnings(champ);
        }
    }

    /**
     * Distribui o pool acumulado de todas as partidas do campeonato ao ser encerrado.
     */
    @Transactional
    public void calculateChampionshipWinnings(Championship championship) {
        List<Match> matches = Match.list("championship.id", championship.id);
        if (matches.isEmpty()) return;

        List<UUID> matchIds = matches.stream().map(m -> m.id).toList();
        List<Bet> allBets = Bet.getEntityManager()
            .createQuery("SELECT b FROM Bet b JOIN FETCH b.group JOIN FETCH b.user WHERE b.match.id IN :ids", Bet.class)
            .setParameter("ids", matchIds)
            .getResultList();

        String scoringMode = championship.scoringMode != null ? championship.scoringMode : "PROPORTIONAL";

        Map<UUID, List<Bet>> byGroup = allBets.stream().collect(Collectors.groupingBy(b -> b.group.id));

        for (List<Bet> groupBets : byGroup.values()) {
            // Zera winnings atuais antes de redistribuir
            for (Bet bet : groupBets) {
                BetResult r = BetResult.<BetResult>find("bet.id", bet.id).firstResult();
                if (r != null) { r.winnings = BigDecimal.ZERO; r.persist(); }
            }

            BigDecimal totalPool = groupBets.stream()
                .map(b -> b.amount != null ? b.amount : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Qualifyng points por usuário
            Map<UUID, Integer> userQualPoints = new java.util.HashMap<>();
            for (Bet bet : groupBets) {
                BetResult r = BetResult.<BetResult>find("bet.id", bet.id).firstResult();
                if (r == null) continue;
                int q = "EXACT_ONLY".equals(scoringMode) ? (r.isExact ? 10 : 0) : r.points;
                userQualPoints.merge(bet.user.id, q, Integer::sum);
            }

            int totalQualPoints = userQualPoints.values().stream().mapToInt(Integer::intValue).sum();

            if (totalQualPoints == 0) {
                // Ninguém acertou: devolve cada um o que apostou
                for (Bet bet : groupBets) {
                    BetResult r = BetResult.<BetResult>find("bet.id", bet.id).firstResult();
                    if (r != null) { r.winnings = bet.amount != null ? bet.amount : BigDecimal.ZERO; r.persist(); }
                }
                continue;
            }

            // Concentra os ganhos do usuário na primeira aposta (evita dupla contagem no leaderboard)
            Map<UUID, Bet> firstBet = new java.util.LinkedHashMap<>();
            for (Bet bet : groupBets) firstBet.putIfAbsent(bet.user.id, bet);

            for (Map.Entry<UUID, Bet> entry : firstBet.entrySet()) {
                int pts = userQualPoints.getOrDefault(entry.getKey(), 0);
                if (pts == 0) continue;
                BigDecimal winnings = totalPool
                    .multiply(BigDecimal.valueOf(pts))
                    .divide(BigDecimal.valueOf(totalQualPoints), 2, RoundingMode.HALF_UP);
                BetResult r = BetResult.<BetResult>find("bet.id", entry.getValue().id).firstResult();
                if (r != null) { r.winnings = winnings; r.persist(); }
            }
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void distributeWinnings(List<Bet> pending, BigDecimal totalPool,
                                    String scoringMode, int realHome, int realAway) {
        int totalQualPoints = pending.stream()
            .mapToInt(b -> qualifyingPoints(b, realHome, realAway, scoringMode))
            .sum();

        for (Bet bet : pending) {
            BetResult r = BetResult.<BetResult>find("bet.id", bet.id).firstResult();
            if (r == null) continue;

            BigDecimal winnings;
            if (totalQualPoints == 0) {
                // Ninguém acertou: devolve o que cada um apostou
                winnings = bet.amount != null ? bet.amount : BigDecimal.ZERO;
            } else {
                int q = qualifyingPoints(bet, realHome, realAway, scoringMode);
                winnings = q == 0 ? BigDecimal.ZERO :
                    totalPool.multiply(BigDecimal.valueOf(q))
                             .divide(BigDecimal.valueOf(totalQualPoints), 2, RoundingMode.HALF_UP);
            }
            r.winnings = winnings;
            r.persist();
        }
    }

    private int qualifyingPoints(Bet bet, int realHome, int realAway, String scoringMode) {
        boolean exact = (bet.homeScore == realHome && bet.awayScore == realAway);
        if ("EXACT_ONLY".equals(scoringMode)) return exact ? 10 : 0;
        return calculatePoints(bet.homeScore, bet.awayScore, realHome, realAway);
    }

    int calculatePoints(int betHome, int betAway, int realHome, int realAway) {
        if (betHome == realHome && betAway == realAway) return 10;
        int betWinner = Integer.signum(betHome - betAway);
        int realWinner = Integer.signum(realHome - realAway);
        if (betWinner != realWinner) return 0;
        return (betHome - betAway) == (realHome - realAway) ? 7 : 3;
    }
}
