package com.investwise.recurring.dto;

import com.investwise.recurring.entity.RecurringFrequency;
import com.investwise.recurring.entity.RecurringStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecurringPlanResponse {
    private Long id;
    private Long userId;
    private String symbol;
    private String assetName;
    private BigDecimal amount;
    private RecurringFrequency frequency;
    private LocalDate nextExecutionDate;
    private RecurringStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}
