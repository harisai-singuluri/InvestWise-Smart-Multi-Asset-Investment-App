package com.investwise.marketdata.service;

import com.investwise.marketdata.dto.MarketQuoteResponse;
import com.investwise.marketdata.dto.PriceHistoryPoint;

import java.util.List;

public interface MarketDataProvider {
    MarketQuoteResponse getQuote(String symbol);
    List<PriceHistoryPoint> getPriceHistory(String symbol, String timeframe);
    void updateQuoteSimulated(String symbol, java.math.BigDecimal newPrice);
}
