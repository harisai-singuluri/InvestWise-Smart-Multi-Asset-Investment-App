package com.investwise.order.dto;

import com.investwise.order.entity.OrderSide;
import com.investwise.order.entity.OrderStatus;
import com.investwise.order.entity.OrderType;
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
public class OrderResponse {
    private Long id;
    private Long userId;
    private String symbol;
    private String assetName;
    private OrderSide side;
    private OrderType type;
    private BigDecimal quantity;
    private BigDecimal limitPrice;
    private BigDecimal triggerPrice;
    private BigDecimal filledPrice;
    private BigDecimal fee;
    private OrderStatus status;
    private String idempotencyKey;
    private String failureReason;
    private Instant createdAt;
    private Instant updatedAt;
}
