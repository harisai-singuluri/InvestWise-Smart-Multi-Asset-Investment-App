package com.investwise.alert.dto;

import com.investwise.alert.entity.AlertCondition;
import com.investwise.alert.entity.AlertStatus;
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
public class PriceAlertResponse {
    private Long id;
    private Long userId;
    private String symbol;
    private String assetName;
    private AlertCondition alertCondition;
    private BigDecimal thresholdPrice;
    private AlertStatus status;
    private Instant triggeredAt;
    private Instant createdAt;
}
