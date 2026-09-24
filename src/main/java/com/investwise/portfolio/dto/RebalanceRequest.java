package com.investwise.portfolio.dto;

import com.investwise.asset.entity.AssetClass;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RebalanceRequest {

    @NotEmpty(message = "Target allocations cannot be empty")
    private Map<String, BigDecimal> targetPercentages;
}
