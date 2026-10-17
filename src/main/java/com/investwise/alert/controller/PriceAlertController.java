package com.investwise.alert.controller;

import com.investwise.alert.dto.PriceAlertRequest;
import com.investwise.alert.dto.PriceAlertResponse;
import com.investwise.alert.service.PriceAlertService;
import com.investwise.common.response.ApiResponse;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Price Alerts", description = "Endpoints for configuring and managing asset price alerts")
public class PriceAlertController {

    private final PriceAlertService priceAlertService;
    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new price alert for an asset")
    public ResponseEntity<ApiResponse<PriceAlertResponse>> createAlert(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PriceAlertRequest request) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        PriceAlertResponse response = priceAlertService.createAlert(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Price alert set successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all configured price alerts for user")
    public ResponseEntity<ApiResponse<List<PriceAlertResponse>>> getAlerts(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        List<PriceAlertResponse> alerts = priceAlertService.getUserAlerts(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(alerts));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a price alert")
    public ResponseEntity<ApiResponse<Void>> deleteAlert(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        priceAlertService.deleteAlert(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Price alert deleted", null));
    }
}
