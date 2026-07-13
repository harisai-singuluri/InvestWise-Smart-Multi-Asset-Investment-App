package com.investwise.account.controller;

import com.investwise.account.dto.AccountResponse;
import com.investwise.account.service.AccountService;
import com.investwise.common.response.ApiResponse;
import com.investwise.user.entity.User;
import com.investwise.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Endpoints for user demo cash balance and account management")
public class AccountController {

    private final AccountService accountService;
    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get cash account balance for the authenticated user")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccount(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        AccountResponse response = accountService.getAccountResponseByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/demo/reset")
    @Operation(summary = "Reset demo account balance to $100,000 initial cash")
    public ResponseEntity<ApiResponse<AccountResponse>> resetDemoAccount(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        AccountResponse response = accountService.resetDemoAccount(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Demo balance reset successfully", response));
    }
}
