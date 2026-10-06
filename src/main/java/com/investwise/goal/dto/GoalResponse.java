package com.investwise.goal.dto;

import com.investwise.goal.entity.GoalStatus;
import com.investwise.goal.entity.RiskProfile;
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
public class GoalResponse {
    private Long id;
    private Long userId;
    private String title;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private BigDecimal progressPercentage;
    private LocalDate targetDate;
    private RiskProfile riskProfile;
    private GoalStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}
