package com.localbet.group;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class LeaderboardEntry {
    public String userId;
    public String userName;
    public long totalPoints;
    public long exactScores;
    public long totalBets;
    public BigDecimal totalBet;
    public BigDecimal totalWinnings;
    public long xp;
    public long level;
    public long nextLevelXp;
    public List<String> badges;

    public LeaderboardEntry(String userId, String userName, long totalPoints, long exactScores, long totalBets,
                            BigDecimal totalBet, BigDecimal totalWinnings) {
        this.userId = userId;
        this.userName = userName;
        this.totalPoints = totalPoints;
        this.exactScores = exactScores;
        this.totalBets = totalBets;
        this.totalBet = totalBet != null ? totalBet : BigDecimal.ZERO;
        this.totalWinnings = totalWinnings != null ? totalWinnings : BigDecimal.ZERO;
        this.xp = calculateXp();
        this.level = (this.xp / 100) + 1;
        this.nextLevelXp = this.level * 100;
        this.badges = calculateBadges();
    }

    private long calculateXp() {
        return (totalBets * 5) + (totalPoints * 5) + (exactScores * 25);
    }

    private List<String> calculateBadges() {
        List<String> result = new ArrayList<>();
        if (totalBets >= 1) result.add("Primeiro palpite");
        if (totalPoints > 0) result.add("Saiu do zero");
        if (exactScores >= 1) result.add("Na mosca");
        if (exactScores >= 3) result.add("Mão cirúrgica");
        if (totalBets >= 10) result.add("Fiel do grupo");
        if (totalPoints >= 100) result.add("Centenário");
        return result;
    }
}
