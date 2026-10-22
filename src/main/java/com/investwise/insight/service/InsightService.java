package com.investwise.insight.service;

import com.investwise.insight.dto.InsightResponse;
import com.investwise.insight.entity.Insight;
import com.investwise.insight.entity.InsightType;
import com.investwise.insight.repository.InsightRepository;
import com.investwise.portfolio.dto.HoldingResponse;
import com.investwise.portfolio.dto.PortfolioSummaryResponse;
import com.investwise.portfolio.service.PortfolioService;
import com.investwise.user.entity.User;
import com.investwise.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InsightService {

    private final InsightRepository insightRepository;
    private final PortfolioService portfolioService;
    private final UserService userService;

    @Transactional
    public List<InsightResponse> generateAndGetInsights(Long userId) {
        User user = userService.getUserById(userId);
        PortfolioSummaryResponse portfolio = portfolioService.getPortfolioSummary(userId);

        List<InsightResponse> insights = new ArrayList<>();

        if (portfolio.getHoldings() == null || portfolio.getHoldings().isEmpty()) {
            insights.add(InsightResponse.builder()
                    .id(1L)
                    .title("High Cash Allocation")
                    .summary("Your portfolio currently holds 100% demo cash ($" + portfolio.getCashBalance() + "). Consider exploring asset classes such as US Stocks, ETFs, or Digital Gold to start your simulated wealth building journey.")
                    .insightType(InsightType.RISK_DIVERSIFICATION)
                    .confidenceScore(new BigDecimal("0.99"))
                    .provider("DETERMINISTIC_FINANCIAL_ENGINE")
                    .createdAt(Instant.now())
                    .build());
            return insights;
        }

        HoldingResponse largestHolding = portfolio.getHoldings().stream()
                .max((h1, h2) -> h1.getCurrentValue().compareTo(h2.getCurrentValue()))
                .orElse(null);

        if (largestHolding != null && largestHolding.getAllocationPercent().compareTo(new BigDecimal("30.00")) > 0) {
            insights.add(InsightResponse.builder()
                    .id(2L)
                    .title("Single Asset Concentration Notice")
                    .summary(String.format("%s represents %s%% of your total portfolio value. Financial research suggests limiting single equity exposure to under 20%% to mitigate idiosyncratic downside volatility.",
                            largestHolding.getSymbol(), largestHolding.getAllocationPercent()))
                    .insightType(InsightType.PORTFOLIO_CONCENTRATION)
                    .confidenceScore(new BigDecimal("0.95"))
                    .provider("DETERMINISTIC_FINANCIAL_ENGINE")
                    .createdAt(Instant.now())
                    .build());
        }

        long distinctClasses = portfolio.getHoldings().stream()
                .map(HoldingResponse::getAssetClass)
                .distinct()
                .count();

        if (distinctClasses >= 3) {
            insights.add(InsightResponse.builder()
                    .id(3L)
                    .title("Healthy Multi-Asset Diversification")
                    .summary(String.format("Your portfolio is spread across %d different asset classes. Multi-asset investing helps balance market cycles between equities, fixed income/funds, commodities, and alternative assets.", distinctClasses))
                    .insightType(InsightType.RISK_DIVERSIFICATION)
                    .confidenceScore(new BigDecimal("0.92"))
                    .provider("DETERMINISTIC_FINANCIAL_ENGINE")
                    .createdAt(Instant.now())
                    .build());
        } else {
            insights.add(InsightResponse.builder()
                    .id(4L)
                    .title("Diversification Opportunity")
                    .summary("You currently invest across fewer than 3 asset classes. Spreading risk across ETFs, index funds, and digital gold can improve risk-adjusted Sharpe ratios over market cycles.")
                    .insightType(InsightType.RISK_DIVERSIFICATION)
                    .confidenceScore(new BigDecimal("0.88"))
                    .provider("DETERMINISTIC_FINANCIAL_ENGINE")
                    .createdAt(Instant.now())
                    .build());
        }

        if (portfolio.getTotalUnrealizedPnL().compareTo(BigDecimal.ZERO) > 0) {
            insights.add(InsightResponse.builder()
                    .id(5L)
                    .title("Positive Portfolio Unrealized Return")
                    .summary(String.format("Your active holdings currently hold an unrealized gain of +$%s (+%s%%). Remember that returns are simulated based on demo pricing models.",
                            portfolio.getTotalUnrealizedPnL(), portfolio.getTotalReturnPercent()))
                    .insightType(InsightType.ASSET_MOMENTUM)
                    .confidenceScore(new BigDecimal("0.98"))
                    .provider("DETERMINISTIC_FINANCIAL_ENGINE")
                    .createdAt(Instant.now())
                    .build());
        }

        return insights;
    }
}
