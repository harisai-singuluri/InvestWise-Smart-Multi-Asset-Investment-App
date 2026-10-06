package com.investwise.goal.dto;

import com.investwise.goal.entity.RiskProfile;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalRequest {

    @NotBlank(message = "Goal title is required")
    private String title;

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "1.00", message = "Target amount must be at least $1.00")
    private BigDecimal targetAmount;

    private BigDecimal initialContribution;

    @NotNull(message = "Target date is required")
    @Future(message = "Target date must be in the future")
    private LocalDate targetDate;

    private RiskProfile riskProfile;
}
