package com.investwise.recurring.controller;

import com.investwise.common.response.ApiResponse;
import com.investwise.recurring.dto.RecurringPlanRequest;
import com.investwise.recurring.dto.RecurringPlanResponse;
import com.investwise.recurring.entity.RecurringStatus;
import com.investwise.recurring.service.RecurringPlanService;
import com.investwise.user.entity.User;
import com.investwise.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recurring-plans")
@RequiredArgsConstructor
@Tag(name = "Recurring Investing", description = "Endpoints for Dollar Cost Averaging (DCA) and scheduled auto-investment plans")
public class RecurringPlanController {

    private final RecurringPlanService recurringPlanService;
    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new recurring DCA investment plan")
    public ResponseEntity<ApiResponse<RecurringPlanResponse>> createPlan(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RecurringPlanRequest request) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        RecurringPlanResponse response = recurringPlanService.createPlan(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Recurring investment plan created successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all recurring investment plans for authenticated user")
    public ResponseEntity<ApiResponse<List<RecurringPlanResponse>>> getPlans(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        List<RecurringPlanResponse> plans = recurringPlanService.getUserPlans(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(plans));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Pause, resume, or cancel a recurring plan")
    public ResponseEntity<ApiResponse<RecurringPlanResponse>> updateStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam RecurringStatus status) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        RecurringPlanResponse response = recurringPlanService.updatePlanStatus(user.getId(), id, status);
        return ResponseEntity.ok(ApiResponse.ok("Recurring plan status updated", response));
    }
}
