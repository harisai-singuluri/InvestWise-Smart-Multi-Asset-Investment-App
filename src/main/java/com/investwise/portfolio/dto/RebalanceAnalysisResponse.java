package com.investwise.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RebalanceAnalysisResponse {
    private BigDecimal totalPortfolioValue;
    private boolean balanced;
    private List<RebalanceRecommendationItem> recommendations;
}
