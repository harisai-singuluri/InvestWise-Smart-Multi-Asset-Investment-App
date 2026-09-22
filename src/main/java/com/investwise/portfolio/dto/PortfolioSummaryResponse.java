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
public class PortfolioSummaryResponse {
    private BigDecimal totalPortfolioValue;
    private BigDecimal cashBalance;
    private BigDecimal availableCash;
    private BigDecimal reservedCash;
    private BigDecimal totalInvested;
    private BigDecimal totalUnrealizedPnL;
    private BigDecimal totalReturnPercent;
    private List<HoldingResponse> holdings;
    private List<AllocationItem> allocation;
}
