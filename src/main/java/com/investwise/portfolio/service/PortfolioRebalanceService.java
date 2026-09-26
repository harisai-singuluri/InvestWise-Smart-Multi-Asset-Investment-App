package com.investwise.portfolio.service;

import com.investwise.asset.entity.Asset;
import com.investwise.asset.entity.AssetClass;
import com.investwise.asset.repository.AssetRepository;
import com.investwise.common.exception.BadRequestException;
import com.investwise.marketdata.dto.MarketQuoteResponse;
import com.investwise.marketdata.service.MarketDataService;
import com.investwise.order.dto.OrderRequest;
import com.investwise.order.entity.OrderSide;
import com.investwise.order.entity.OrderType;
import com.investwise.order.service.OrderService;
import com.investwise.portfolio.dto.AllocationItem;
import com.investwise.portfolio.dto.HoldingResponse;
import com.investwise.portfolio.dto.PortfolioSummaryResponse;
import com.investwise.portfolio.dto.RebalanceAnalysisResponse;
import com.investwise.portfolio.dto.RebalanceRecommendationItem;
import com.investwise.portfolio.dto.RebalanceRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PortfolioRebalanceService {

    private final PortfolioService portfolioService;
    private final AssetRepository assetRepository;
    private final MarketDataService marketDataService;
    private final OrderService orderService;

    public RebalanceAnalysisResponse analyzeRebalance(Long userId, RebalanceRequest request) {
        if (request == null || request.getTargetPercentages() == null || request.getTargetPercentages().isEmpty()) {
            throw new BadRequestException("Target allocations must be provided");
        }

        Map<String, BigDecimal> targetMap = request.getTargetPercentages();
        BigDecimal totalTarget = targetMap.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        if (totalTarget.compareTo(new BigDecimal("99.00")) < 0 || totalTarget.compareTo(new BigDecimal("101.00")) > 0) {
            throw new BadRequestException("Target allocations must sum to 100%");
        }

        PortfolioSummaryResponse summary = portfolioService.getPortfolioSummary(userId);
        BigDecimal totalValue = summary.getTotalPortfolioValue();

        Map<String, BigDecimal> currentMap = new HashMap<>();
        for (AllocationItem item : summary.getAllocation()) {
            currentMap.put(item.getCategory().toUpperCase(), item.getPercentage());
        }

        List<RebalanceRecommendationItem> recommendations = new ArrayList<>();
        boolean isBalanced = true;

        for (Map.Entry<String, BigDecimal> entry : targetMap.entrySet()) {
            String category = entry.getKey().toUpperCase();
            BigDecimal targetPct = entry.getValue();
            BigDecimal currentPct = currentMap.getOrDefault(category, BigDecimal.ZERO);
            BigDecimal deltaPct = targetPct.subtract(currentPct);

            if (deltaPct.abs().compareTo(new BigDecimal("1.00")) > 0) {
                isBalanced = false;
            }

            BigDecimal adjustmentAmount = totalValue.multiply(deltaPct.abs()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            String action = deltaPct.compareTo(BigDecimal.ZERO) > 0 ? "BUY" : (deltaPct.compareTo(BigDecimal.ZERO) < 0 ? "SELL" : "HOLD");

            String suggestedSymbol = null;
            BigDecimal suggestedQty = BigDecimal.ZERO;

            if (!category.equals("CASH") && !action.equals("HOLD")) {
                try {
                    AssetClass ac = AssetClass.valueOf(category);
                    List<Asset> candidates = assetRepository.findByAssetClassAndActiveTrue(ac);
                    if (!candidates.isEmpty()) {
                        Asset candidate = candidates.get(0);
                        suggestedSymbol = candidate.getSymbol();
                        MarketQuoteResponse quote = marketDataService.getQuote(suggestedSymbol);
                        if (quote.getPrice().compareTo(BigDecimal.ZERO) > 0) {
                            suggestedQty = adjustmentAmount.divide(quote.getPrice(), 4, RoundingMode.HALF_UP);
                        }
                    }
                } catch (IllegalArgumentException ignored) {
                }
            }

            recommendations.add(RebalanceRecommendationItem.builder()
                    .category(category)
                    .currentPercentage(currentPct)
                    .targetPercentage(targetPct)
                    .deltaPercentage(deltaPct)
                    .action(action)
                    .adjustmentAmount(adjustmentAmount)
                    .suggestedSymbol(suggestedSymbol)
                    .suggestedQuantity(suggestedQty)
                    .build());
        }

        return RebalanceAnalysisResponse.builder()
                .totalPortfolioValue(totalValue)
                .balanced(isBalanced)
                .recommendations(recommendations)
                .build();
    }

    @Transactional
    public RebalanceAnalysisResponse executeRebalance(Long userId, RebalanceRequest request) {
        RebalanceAnalysisResponse analysis = analyzeRebalance(userId, request);

        for (RebalanceRecommendationItem item : analysis.getRecommendations()) {
            if (item.getSuggestedSymbol() != null && item.getSuggestedQuantity().compareTo(BigDecimal.ZERO) > 0) {
                try {
                    OrderSide side = item.getAction().equalsIgnoreCase("BUY") ? OrderSide.BUY : OrderSide.SELL;
                    OrderRequest orderRequest = OrderRequest.builder()
                            .symbol(item.getSuggestedSymbol())
                            .side(side)
                            .type(OrderType.MARKET)
                            .quantity(item.getSuggestedQuantity())
                            .idempotencyKey("rebal-" + userId + "-" + item.getSuggestedSymbol() + "-" + UUID.randomUUID())
                            .build();

                    orderService.submitOrder(userId, orderRequest);
                } catch (Exception ignored) {
                }
            }
        }

        return analyzeRebalance(userId, request);
    }
}
