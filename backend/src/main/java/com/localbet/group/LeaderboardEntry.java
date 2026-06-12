package com.localbet.group;

import java.math.BigDecimal;

public class LeaderboardEntry {
    public String userId;
    public String userName;
    public long totalPoints;
    public long exactScores;
    public BigDecimal totalBet;
    public BigDecimal totalWinnings;

    public LeaderboardEntry(String userId, String userName, long totalPoints, long exactScores,
                            BigDecimal totalBet, BigDecimal totalWinnings) {
        this.userId = userId;
        this.userName = userName;
        this.totalPoints = totalPoints;
        this.exactScores = exactScores;
        this.totalBet = totalBet != null ? totalBet : BigDecimal.ZERO;
        this.totalWinnings = totalWinnings != null ? totalWinnings : BigDecimal.ZERO;
    }
}
