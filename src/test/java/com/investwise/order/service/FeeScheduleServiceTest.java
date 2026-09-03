package com.investwise.order.service;

import com.investwise.asset.entity.AssetClass;
import com.investwise.order.entity.OrderSide;
import com.investwise.order.entity.OrderType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FeeScheduleServiceTest {

    private FeeScheduleService feeScheduleService;

    @BeforeEach
    void setUp() {
        feeScheduleService = new FeeScheduleService();
    }

    @Test
    void calculateFee_StocksFee() {
        BigDecimal notional = new BigDecimal("10000.0000");
        BigDecimal fee = feeScheduleService.calculateFee(notional, AssetClass.STOCKS);

        assertEquals(new BigDecimal("5.0000"), fee);
    }

    @Test
    void calculateFee_MutualFunds_ZeroFee() {
        BigDecimal notional = new BigDecimal("10000.0000");
        BigDecimal fee = feeScheduleService.calculateFee(notional, AssetClass.MUTUAL_FUNDS);

        assertEquals(new BigDecimal("0.0000"), fee);
    }

    @Test
    void calculateExecutionPrice_MarketBuyAppliesSpread() {
        BigDecimal quotePrice = new BigDecimal("100.0000");
        BigDecimal executed = feeScheduleService.calculateExecutionPrice(quotePrice, OrderSide.BUY, OrderType.MARKET, AssetClass.CRYPTO);

        assertTrue(executed.compareTo(quotePrice) > 0);
    }

    @Test
    void calculateExecutionPrice_MarketSellAppliesSpread() {
        BigDecimal quotePrice = new BigDecimal("100.0000");
        BigDecimal executed = feeScheduleService.calculateExecutionPrice(quotePrice, OrderSide.SELL, OrderType.MARKET, AssetClass.CRYPTO);

        assertTrue(executed.compareTo(quotePrice) < 0);
    }
}
