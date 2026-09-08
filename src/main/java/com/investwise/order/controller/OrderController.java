package com.investwise.order.controller;

import com.investwise.common.response.ApiResponse;
import com.investwise.order.dto.OrderRequest;
import com.investwise.order.dto.OrderResponse;
import com.investwise.order.entity.OrderStatus;
import com.investwise.order.service.OrderService;
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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Endpoints for placing, inspecting, and cancelling simulated investment orders")
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    @PostMapping
    @Operation(summary = "Submit a simulated market or limit order with idempotency protection")
    public ResponseEntity<ApiResponse<OrderResponse>> submitOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKeyHeader,
            @Valid @RequestBody OrderRequest request) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        if (idempotencyKeyHeader != null && !idempotencyKeyHeader.isBlank()) {
            request.setIdempotencyKey(idempotencyKeyHeader);
        }

        OrderResponse response = orderService.submitOrder(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Order submitted successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get user order history with optional status filter")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) OrderStatus status) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        List<OrderResponse> orders = orderService.getUserOrders(user.getId(), status);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an open limit order and release reserved demo balance")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        OrderResponse response = orderService.cancelOrder(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled successfully", response));
    }
}
