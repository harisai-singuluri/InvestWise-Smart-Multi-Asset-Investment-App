package com.investwise.marketdata.controller;

import com.investwise.common.response.ApiResponse;
import com.investwise.marketdata.dto.MarketQuoteResponse;
import com.investwise.marketdata.service.MarketDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
@Tag(name = "Market Data", description = "Endpoints for real-time quotes, simulated ticks, and SSE streaming")
public class MarketDataController {

    private final MarketDataService marketDataService;

    @GetMapping("/quotes/{symbol}")
    @Operation(summary = "Get the latest market quote for an asset")
    public ResponseEntity<ApiResponse<MarketQuoteResponse>> getQuote(@PathVariable String symbol) {
        MarketQuoteResponse quote = marketDataService.getQuote(symbol);
        return ResponseEntity.ok(ApiResponse.ok(quote));
    }

    @PostMapping("/quotes/{symbol}/simulate")
    @Operation(summary = "Update simulated price quote for testing triggers and limit orders")
    public ResponseEntity<ApiResponse<MarketQuoteResponse>> simulatePriceUpdate(
            @PathVariable String symbol,
            @RequestParam BigDecimal newPrice) {
        marketDataService.updateQuoteSimulated(symbol, newPrice);
        MarketQuoteResponse updated = marketDataService.getQuote(symbol);
        return ResponseEntity.ok(ApiResponse.ok("Quote updated successfully", updated));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream real-time market quote updates via Server-Sent Events (SSE)")
    public SseEmitter streamMarketQuotes() {
        SseEmitter emitter = new SseEmitter(180000L);
        ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();

        executor.scheduleAtFixedRate(() -> {
            try {
                MarketQuoteResponse btc = marketDataService.getQuote("BTC");
                MarketQuoteResponse aapl = marketDataService.getQuote("AAPL");
                emitter.send(SseEmitter.event().name("quote-tick").data(List.of(btc, aapl)));
            } catch (Exception e) {
                emitter.complete();
                executor.shutdown();
            }
        }, 0, 3, TimeUnit.SECONDS);

        emitter.onCompletion(executor::shutdown);
        emitter.onTimeout(executor::shutdown);
        emitter.onError(t -> executor.shutdown());

        return emitter;
    }
}
