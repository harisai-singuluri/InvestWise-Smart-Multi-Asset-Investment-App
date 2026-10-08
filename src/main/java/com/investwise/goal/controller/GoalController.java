package com.investwise.goal.controller;

import com.investwise.common.response.ApiResponse;
import com.investwise.goal.dto.GoalRequest;
import com.investwise.goal.dto.GoalResponse;
import com.investwise.goal.service.GoalService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/goals")
@RequiredArgsConstructor
@Tag(name = "Goals", description = "Endpoints for creating and tracking financial investment goals")
public class GoalController {

    private final GoalService goalService;
    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new investment goal with target amount and date")
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody GoalRequest request) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        GoalResponse response = goalService.createGoal(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Investment goal created successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all investment goals for authenticated user")
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getGoals(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        List<GoalResponse> goals = goalService.getUserGoals(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(goals));
    }

    @PostMapping("/{id}/contribute")
    @Operation(summary = "Contribute demo cash to an investment goal")
    public ResponseEntity<ApiResponse<GoalResponse>> contributeToGoal(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        GoalResponse response = goalService.contributeToGoal(user.getId(), id, amount);
        return ResponseEntity.ok(ApiResponse.ok("Contribution added successfully", response));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a goal and refund current saved amount back to available balance")
    public ResponseEntity<ApiResponse<GoalResponse>> cancelGoal(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        GoalResponse response = goalService.cancelGoal(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Goal cancelled and funds refunded", response));
    }
}
