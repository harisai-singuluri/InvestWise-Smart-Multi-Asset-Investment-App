package com.investwise.insight.controller;

import com.investwise.common.response.ApiResponse;
import com.investwise.insight.dto.InsightResponse;
import com.investwise.insight.service.InsightService;
import com.investwise.user.entity.User;
import com.investwise.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/insights")
@RequiredArgsConstructor
@Tag(name = "AI Insights", description = "Endpoints for AI and heuristic portfolio risk and concentration insights")
public class InsightController {

    private final InsightService insightService;
    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get AI-generated and deterministic risk analysis for current portfolio")
    public ResponseEntity<ApiResponse<List<InsightResponse>>> getInsights(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        List<InsightResponse> insights = insightService.generateAndGetInsights(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(insights));
    }
}
