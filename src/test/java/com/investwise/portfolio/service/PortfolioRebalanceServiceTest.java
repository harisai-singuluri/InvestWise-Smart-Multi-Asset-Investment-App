package com.investwise.portfolio.service;

import com.investwise.asset.entity.Asset;
import com.investwise.asset.entity.AssetClass;
import com.investwise.asset.repository.AssetRepository;
import com.investwise.common.exception.BadRequestException;
import com.investwise.marketdata.dto.MarketQuoteResponse;
import com.investwise.marketdata.service.MarketDataService;
import com.investwise.order.service.OrderService;
import com.investwise.portfolio.dto.AllocationItem;
import com.investwise.portfolio.dto.PortfolioSummaryResponse;
import com.investwise.portfolio.dto.RebalanceAnalysisResponse;
import com.investwise.portfolio.dto.RebalanceRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PortfolioRebalanceServiceTest {

    @Mock
    private PortfolioService portfolioService;

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private MarketDataService marketDataService;

    @Mock
    private OrderService orderService;

    @InjectMocks
    private PortfolioRebalanceService rebalanceService;

    private PortfolioSummaryResponse sampleSummary;

    @BeforeEach
    void setUp() {
        sampleSummary = PortfolioSummaryResponse.builder()
                .totalPortfolioValue(new BigDecimal("100000.0000"))
                .allocation(List.of(
                        new AllocationItem("CASH", new BigDecimal("100000.00"), new BigDecimal("100.00"))
                ))
                .build();
    }

    @Test
    void analyzeRebalance_DetectsUnbalancedAndRecommendsTrades() {
        when(portfolioService.getPortfolioSummary(1L)).thenReturn(sampleSummary);

        Asset stockAsset = Asset.builder().symbol("AAPL").assetClass(AssetClass.STOCKS).build();
        when(assetRepository.findByAssetClassAndActiveTrue(AssetClass.STOCKS)).thenReturn(List.of(stockAsset));
        when(marketDataService.getQuote("AAPL")).thenReturn(MarketQuoteResponse.builder().price(new BigDecimal("200.0000")).build());

        RebalanceRequest request = RebalanceRequest.builder()
                .targetPercentages(Map.of(
                        "CASH", new BigDecimal("20.00"),
                        "STOCKS", new BigDecimal("80.00")
                ))
                .build();

        RebalanceAnalysisResponse response = rebalanceService.analyzeRebalance(1L, request);

        assertNotNull(response);
        assertFalse(response.isBalanced());
        assertEquals(2, response.getRecommendations().size());
    }

    @Test
    void analyzeRebalance_InvalidSum_ThrowsBadRequest() {
        RebalanceRequest request = RebalanceRequest.builder()
                .targetPercentages(Map.of(
                        "CASH", new BigDecimal("20.00"),
                        "STOCKS", new BigDecimal("50.00")
                ))
                .build();

        assertThrows(BadRequestException.class, () -> rebalanceService.analyzeRebalance(1L, request));
    }
}
