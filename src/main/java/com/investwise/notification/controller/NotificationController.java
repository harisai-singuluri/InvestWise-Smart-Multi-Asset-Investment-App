package com.investwise.notification.controller;

import com.investwise.common.response.ApiResponse;
import com.investwise.notification.dto.NotificationResponse;
import com.investwise.notification.service.NotificationService;
import com.investwise.user.entity.User;
import com.investwise.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints for user alerts, order fills, and system notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get user notifications feed")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        List<NotificationResponse> notifications = notificationService.getUserNotifications(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(notifications));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        NotificationResponse response = notificationService.markAsRead(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", response));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }
}
