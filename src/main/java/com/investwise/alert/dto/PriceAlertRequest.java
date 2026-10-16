package com.investwise.alert.dto;

import com.investwise.alert.entity.AlertCondition;
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
public class PriceAlertRequest {

    @NotBlank(message = "Asset symbol is required")
    private String symbol;

    @NotNull(message = "Alert condition is required")
    private AlertCondition alertCondition;

    @NotNull(message = "Threshold price is required")
    @DecimalMin(value = "0.0001", message = "Threshold price must be greater than zero")
    private BigDecimal thresholdPrice;
}
