package com.investwise.ledger.dto;

import com.investwise.order.entity.OrderSide;
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
public class TransactionResponse {
    private Long id;
    private Long orderId;
    private Long userId;
    private String assetSymbol;
    private String assetName;
    private OrderSide side;
    private BigDecimal quantity;
    private BigDecimal executionPrice;
    private BigDecimal totalAmount;
    private BigDecimal fee;
    private Instant timestamp;
}
