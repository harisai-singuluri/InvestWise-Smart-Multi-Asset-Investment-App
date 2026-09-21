package com.investwise.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformancePoint {
    private Instant timestamp;
    private BigDecimal portfolioValue;
    private BigDecimal netInvested;
}
