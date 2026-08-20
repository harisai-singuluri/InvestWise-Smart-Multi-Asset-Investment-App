package com.investwise.ledger.dto;

import com.investwise.ledger.entity.LedgerEntryType;
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
public class LedgerEntryResponse {
    private Long id;
    private Long transactionId;
    private Long userId;
    private LedgerEntryType entryType;
    private BigDecimal debitAmount;
    private BigDecimal creditAmount;
    private String currency;
    private String assetSymbol;
    private BigDecimal assetQuantity;
    private BigDecimal balanceAfter;
    private Instant timestamp;
}
