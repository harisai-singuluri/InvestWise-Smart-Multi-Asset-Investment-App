package com.investwise.marketdata.dto;

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
public class PriceHistoryPoint {
    private Instant timestamp;
    private BigDecimal price;
    private BigDecimal volume;
}
