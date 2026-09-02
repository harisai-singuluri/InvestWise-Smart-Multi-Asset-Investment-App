package com.investwise.order.service;

import com.investwise.asset.entity.AssetClass;
import com.investwise.order.entity.OrderSide;
import com.investwise.order.entity.OrderType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class FeeScheduleService {

    public BigDecimal getFeeRate(AssetClass assetClass) {
        return switch (assetClass) {
            case STOCKS -> new BigDecimal("0.0005");
            case ETFS -> new BigDecimal("0.0003");
            case CRYPTO -> new BigDecimal("0.0015");
            case MUTUAL_FUNDS -> BigDecimal.ZERO;
            case GOLD -> new BigDecimal("0.0008");
        };
    }

    public BigDecimal getSpreadRate(AssetClass assetClass) {
        return switch (assetClass) {
            case STOCKS -> new BigDecimal("0.0002");
            case ETFS -> new BigDecimal("0.0001");
            case CRYPTO -> new BigDecimal("0.0010");
            case MUTUAL_FUNDS -> BigDecimal.ZERO;
            case GOLD -> new BigDecimal("0.0005");
        };
    }

    public BigDecimal calculateFee(BigDecimal notionalAmount, AssetClass assetClass) {
        BigDecimal rate = getFeeRate(assetClass);
        return notionalAmount.multiply(rate).setScale(4, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateExecutionPrice(BigDecimal quotePrice, OrderSide side, OrderType orderType, AssetClass assetClass) {
        if (orderType != OrderType.MARKET) {
            return quotePrice;
        }

        BigDecimal spreadRate = getSpreadRate(assetClass);
        if (side == OrderSide.BUY) {
            return quotePrice.multiply(BigDecimal.ONE.add(spreadRate)).setScale(4, RoundingMode.HALF_UP);
        } else {
            return quotePrice.multiply(BigDecimal.ONE.subtract(spreadRate)).setScale(4, RoundingMode.HALF_UP);
        }
    }
}
