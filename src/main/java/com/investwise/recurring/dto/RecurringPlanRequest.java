package com.investwise.recurring.dto;

import com.investwise.recurring.entity.RecurringFrequency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecurringPlanRequest {

    @NotBlank(message = "Asset symbol is required")
    private String symbol;

    @NotNull(message = "Recurring investment amount is required")
    @DecimalMin(value = "5.00", message = "Minimum recurring investment amount is $5.00")
    private BigDecimal amount;

    @NotNull(message = "Frequency is required")
    private RecurringFrequency frequency;
}
