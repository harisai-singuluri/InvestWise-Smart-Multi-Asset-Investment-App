package com.investwise.account.dto;

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
public class AccountResponse {
    private Long id;
    private Long userId;
    private String currency;
    private BigDecimal totalBalance;
    private BigDecimal availableCash;
    private BigDecimal reservedCash;
    private Instant updatedAt;
}
