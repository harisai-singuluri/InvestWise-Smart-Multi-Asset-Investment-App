package com.investwise.portfolio.controller;

import com.investwise.common.response.ApiResponse;
import com.investwise.portfolio.dto.PerformancePoint;
import com.investwise.portfolio.dto.PortfolioSummaryResponse;
import com.investwise.portfolio.dto.RebalanceAnalysisResponse;
import com.investwise.portfolio.dto.RebalanceRequest;
import com.investwise.portfolio.service.PortfolioRebalanceService;
import com.investwise.portfolio.service.PortfolioService;
import com.investwise.user.entity.User;
import com.investwise.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
@Tag(name = "Portfolio", description = "Endpoints for portfolio holdings, asset allocation, rebalancing, and performance curve")
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final PortfolioRebalanceService portfolioRebalanceService;
    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get user portfolio summary including holdings, cash, P&L, and asset allocation")
    public ResponseEntity<ApiResponse<PortfolioSummaryResponse>> getPortfolio(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        PortfolioSummaryResponse summary = portfolioService.getPortfolioSummary(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/performance")
    @Operation(summary = "Get portfolio historical performance series for charts (1D, 1W, 1M, 1Y, ALL)")
    public ResponseEntity<ApiResponse<List<PerformancePoint>>> getPerformance(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "1M") String timeframe) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        List<PerformancePoint> performance = portfolioService.getPerformanceHistory(user.getId(), timeframe);
        return ResponseEntity.ok(ApiResponse.ok(performance));
    }

    @PostMapping("/rebalance/analyze")
    @Operation(summary = "Analyze allocation deviations against target portfolio allocation")
    public ResponseEntity<ApiResponse<RebalanceAnalysisResponse>> analyzeRebalance(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RebalanceRequest request) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        RebalanceAnalysisResponse analysis = portfolioRebalanceService.analyzeRebalance(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok(analysis));
    }

    @PostMapping("/rebalance/execute")
    @Operation(summary = "Automatically execute rebalancing market orders to match target allocation")
    public ResponseEntity<ApiResponse<RebalanceAnalysisResponse>> executeRebalance(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RebalanceRequest request) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        RebalanceAnalysisResponse result = portfolioRebalanceService.executeRebalance(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Portfolio rebalance executed successfully", result));
    }
}
