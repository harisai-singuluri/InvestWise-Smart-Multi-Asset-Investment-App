package com.investwise.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RebalanceRecommendationItem {
    private String category;
    private BigDecimal currentPercentage;
    private BigDecimal targetPercentage;
    private BigDecimal deltaPercentage;
    private String action;
    private BigDecimal adjustmentAmount;
    private String suggestedSymbol;
    private BigDecimal suggestedQuantity;
}
