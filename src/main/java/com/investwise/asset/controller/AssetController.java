package com.investwise.asset.controller;

import com.investwise.asset.dto.AssetResponse;
import com.investwise.asset.entity.AssetClass;
import com.investwise.asset.service.AssetService;
import com.investwise.common.response.ApiResponse;
import com.investwise.marketdata.dto.PriceHistoryPoint;
import com.investwise.marketdata.service.MarketDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
@Tag(name = "Assets", description = "Endpoints for discovering, filtering, and inspecting multi-asset instruments")
public class AssetController {

    private final AssetService assetService;
    private final MarketDataService marketDataService;

    @GetMapping
    @Operation(summary = "Search and filter assets across asset classes")
    public ResponseEntity<ApiResponse<List<AssetResponse>>> getAssets(
            @RequestParam(required = false) AssetClass assetClass,
            @RequestParam(required = false) String search) {
        List<AssetResponse> assets = assetService.getAssets(assetClass, search);
        return ResponseEntity.ok(ApiResponse.ok(assets));
    }

    @GetMapping("/{symbol}")
    @Operation(summary = "Get detailed information and latest quote for a single asset")
    public ResponseEntity<ApiResponse<AssetResponse>> getAsset(@PathVariable String symbol) {
        AssetResponse asset = assetService.getAssetBySymbol(symbol);
        return ResponseEntity.ok(ApiResponse.ok(asset));
    }

    @GetMapping("/{symbol}/history")
    @Operation(summary = "Get historical price series for charts (1D, 1W, 1M, 1Y, ALL)")
    public ResponseEntity<ApiResponse<List<PriceHistoryPoint>>> getPriceHistory(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1M") String timeframe) {
        List<PriceHistoryPoint> history = marketDataService.getPriceHistory(symbol, timeframe);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }
}
