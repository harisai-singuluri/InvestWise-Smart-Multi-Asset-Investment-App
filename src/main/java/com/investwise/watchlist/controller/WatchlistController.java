package com.investwise.watchlist.controller;

import com.investwise.asset.dto.AssetResponse;
import com.investwise.common.response.ApiResponse;
import com.investwise.user.entity.User;
import com.investwise.user.service.UserService;
import com.investwise.watchlist.service.WatchlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/watchlist")
@RequiredArgsConstructor
@Tag(name = "Watchlist", description = "Endpoints for managing user personal asset watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;
    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get user watchlist with real-time price quotes")
    public ResponseEntity<ApiResponse<List<AssetResponse>>> getWatchlist(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        List<AssetResponse> watchlist = watchlistService.getUserWatchlist(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(watchlist));
    }

    @PostMapping("/{symbol}")
    @Operation(summary = "Add an asset to user watchlist")
    public ResponseEntity<ApiResponse<AssetResponse>> addToWatchlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String symbol) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        AssetResponse response = watchlistService.addToWatchlist(user.getId(), symbol);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Asset added to watchlist", response));
    }

    @DeleteMapping("/{symbol}")
    @Operation(summary = "Remove an asset from user watchlist")
    public ResponseEntity<ApiResponse<Void>> removeFromWatchlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String symbol) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        watchlistService.removeFromWatchlist(user.getId(), symbol);
        return ResponseEntity.ok(ApiResponse.ok("Asset removed from watchlist", null));
    }
}
