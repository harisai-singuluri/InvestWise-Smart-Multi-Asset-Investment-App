package com.investwise.marketdata.service;

import com.investwise.asset.entity.Asset;
import com.investwise.asset.entity.AssetClass;
import com.investwise.asset.repository.AssetRepository;
import com.investwise.common.exception.ResourceNotFoundException;
import com.investwise.marketdata.dto.MarketQuoteResponse;
import com.investwise.marketdata.dto.PriceHistoryPoint;
import com.investwise.marketdata.entity.MarketQuote;
import com.investwise.marketdata.repository.MarketQuoteRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class MarketDataService implements MarketDataProvider {

    private final MarketQuoteRepository marketQuoteRepository;
    private final AssetRepository assetRepository;

    @PostConstruct
    @Transactional
    public void seedInitialMarketData() {
        if (assetRepository.count() > 0) {
            return;
        }

        List<SeedAssetData> initialAssets = List.of(
                new SeedAssetData("AAPL", "Apple Inc.", AssetClass.STOCKS, "NASDAQ", new BigDecimal("182.50"), new BigDecimal("2.10"), new BigDecimal("1.16"), new BigDecimal("184.20"), new BigDecimal("180.80"), new BigDecimal("55420000")),
                new SeedAssetData("MSFT", "Microsoft Corporation", AssetClass.STOCKS, "NASDAQ", new BigDecimal("420.25"), new BigDecimal("5.45"), new BigDecimal("1.31"), new BigDecimal("422.80"), new BigDecimal("415.10"), new BigDecimal("21400000")),
                new SeedAssetData("NVDA", "NVIDIA Corporation", AssetClass.STOCKS, "NASDAQ", new BigDecimal("880.60"), new BigDecimal("24.80"), new BigDecimal("2.90"), new BigDecimal("888.00"), new BigDecimal("855.00"), new BigDecimal("42100000")),
                new SeedAssetData("GOOGL", "Alphabet Inc.", AssetClass.STOCKS, "NASDAQ", new BigDecimal("175.40"), new BigDecimal("-1.20"), new BigDecimal("-0.68"), new BigDecimal("178.10"), new BigDecimal("174.50"), new BigDecimal("18300000")),
                new SeedAssetData("TSLA", "Tesla Inc.", AssetClass.STOCKS, "NASDAQ", new BigDecimal("178.90"), new BigDecimal("-3.40"), new BigDecimal("-1.86"), new BigDecimal("184.50"), new BigDecimal("176.20"), new BigDecimal("68500000")),

                new SeedAssetData("SPY", "SPDR S&P 500 ETF Trust", AssetClass.ETFS, "NYSE", new BigDecimal("512.30"), new BigDecimal("3.15"), new BigDecimal("0.62"), new BigDecimal("514.00"), new BigDecimal("509.80"), new BigDecimal("74100000")),
                new SeedAssetData("QQQ", "Invesco QQQ Trust (Nasdaq-100)", AssetClass.ETFS, "NASDAQ", new BigDecimal("442.80"), new BigDecimal("4.20"), new BigDecimal("0.96"), new BigDecimal("445.10"), new BigDecimal("439.40"), new BigDecimal("41200000")),
                new SeedAssetData("VOO", "Vanguard S&P 500 ETF", AssetClass.ETFS, "NYSE", new BigDecimal("470.15"), new BigDecimal("2.90"), new BigDecimal("0.62"), new BigDecimal("471.80"), new BigDecimal("468.00"), new BigDecimal("12500000")),

                new SeedAssetData("BTC", "Bitcoin", AssetClass.CRYPTO, "CRYPTO", new BigDecimal("65400.00"), new BigDecimal("1850.00"), new BigDecimal("2.91"), new BigDecimal("66200.00"), new BigDecimal("63400.00"), new BigDecimal("28400000000")),
                new SeedAssetData("ETH", "Ethereum", AssetClass.CRYPTO, "CRYPTO", new BigDecimal("3450.00"), new BigDecimal("95.00"), new BigDecimal("2.83"), new BigDecimal("3520.00"), new BigDecimal("3340.00"), new BigDecimal("14200000000")),
                new SeedAssetData("SOL", "Solana", AssetClass.CRYPTO, "CRYPTO", new BigDecimal("148.50"), new BigDecimal("6.80"), new BigDecimal("4.80"), new BigDecimal("152.00"), new BigDecimal("140.20"), new BigDecimal("3800000000")),

                new SeedAssetData("VFIAX", "Vanguard 500 Index Admiral", AssetClass.MUTUAL_FUNDS, "MUTUAL_FUNDS", new BigDecimal("472.60"), new BigDecimal("1.85"), new BigDecimal("0.39"), new BigDecimal("472.60"), new BigDecimal("470.50"), new BigDecimal("8200000")),
                new SeedAssetData("FCNTX", "Fidelity Contrafund", AssetClass.MUTUAL_FUNDS, "MUTUAL_FUNDS", new BigDecimal("20.14"), new BigDecimal("0.12"), new BigDecimal("0.60"), new BigDecimal("20.20"), new BigDecimal("19.98"), new BigDecimal("4100000")),

                new SeedAssetData("XAU", "Digital Gold (per gram)", AssetClass.GOLD, "COMMODITY", new BigDecimal("75.40"), new BigDecimal("0.65"), new BigDecimal("0.87"), new BigDecimal("75.90"), new BigDecimal("74.60"), new BigDecimal("19500000")),
                new SeedAssetData("GLD", "SPDR Gold Shares ETF", AssetClass.GOLD, "NYSE", new BigDecimal("218.40"), new BigDecimal("1.90"), new BigDecimal("0.88"), new BigDecimal("219.10"), new BigDecimal("216.20"), new BigDecimal("8900000"))
        );

        for (SeedAssetData seed : initialAssets) {
            Asset asset = Asset.builder()
                    .symbol(seed.symbol())
                    .name(seed.name())
                    .assetClass(seed.assetClass())
                    .currency("USD")
                    .exchange(seed.exchange())
                    .active(true)
                    .build();
            Asset savedAsset = assetRepository.save(asset);

            MarketQuote quote = MarketQuote.builder()
                    .asset(savedAsset)
                    .price(seed.price())
                    .change24h(seed.change24h())
                    .changePercent24h(seed.changePercent24h())
                    .high24h(seed.high24h())
                    .low24h(seed.low24h())
                    .volume24h(seed.volume24h())
                    .build();
            marketQuoteRepository.save(quote);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public MarketQuoteResponse getQuote(String symbol) {
        MarketQuote quote = marketQuoteRepository.findByAssetSymbol(symbol.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Quote not found for symbol: " + symbol));
        return mapToQuoteResponse(quote);
    }

    @Override
    public List<PriceHistoryPoint> getPriceHistory(String symbol, String timeframe) {
        MarketQuote quote = marketQuoteRepository.findByAssetSymbol(symbol.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Quote not found for symbol: " + symbol));

        BigDecimal currentPrice = quote.getPrice();
        int points;
        ChronoUnit stepUnit;
        long stepAmount;

        String tf = (timeframe == null || timeframe.isBlank()) ? "1M" : timeframe.toUpperCase();
        switch (tf) {
            case "1D" -> {
                points = 24;
                stepUnit = ChronoUnit.HOURS;
                stepAmount = 1;
            }
            case "1W" -> {
                points = 28;
                stepUnit = ChronoUnit.HOURS;
                stepAmount = 6;
            }
            case "1M" -> {
                points = 30;
                stepUnit = ChronoUnit.DAYS;
                stepAmount = 1;
            }
            case "1Y" -> {
                points = 52;
                stepUnit = ChronoUnit.WEEKS;
                stepAmount = 1;
            }
            case "ALL" -> {
                points = 60;
                stepUnit = ChronoUnit.MONTHS;
                stepAmount = 1;
            }
            default -> {
                points = 30;
                stepUnit = ChronoUnit.DAYS;
                stepAmount = 1;
            }
        }

        List<PriceHistoryPoint> history = new ArrayList<>(points);
        Instant now = Instant.now();
        Random random = new Random(symbol.hashCode() + tf.hashCode());

        double walkMultiplier = switch (tf) {
            case "1D" -> 0.005;
            case "1W" -> 0.015;
            case "1M" -> 0.04;
            case "1Y" -> 0.15;
            case "ALL" -> 0.40;
            default -> 0.05;
        };

        double base = currentPrice.doubleValue() * (1.0 - (walkMultiplier * 0.5));
        double current = base;

        for (int i = points - 1; i >= 0; i--) {
            Instant pointTime = now.minus(i * stepAmount, stepUnit);
            double delta = (random.nextDouble() - 0.48) * (base * walkMultiplier / Math.sqrt(points));
            current = Math.max(current + delta, base * 0.3);

            if (i == 0) {
                current = currentPrice.doubleValue();
            }

            BigDecimal p = BigDecimal.valueOf(current).setScale(4, RoundingMode.HALF_UP);
            BigDecimal vol = quote.getVolume24h().divide(BigDecimal.valueOf(points), 2, RoundingMode.HALF_UP);
            history.add(new PriceHistoryPoint(pointTime, p, vol));
        }

        return history;
    }

    @Override
    @Transactional
    public void updateQuoteSimulated(String symbol, BigDecimal newPrice) {
        MarketQuote quote = marketQuoteRepository.findByAssetSymbol(symbol.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Quote not found for symbol: " + symbol));

        BigDecimal oldPrice = quote.getPrice();
        BigDecimal diff = newPrice.subtract(oldPrice);
        BigDecimal percent = diff.divide(oldPrice, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(4, RoundingMode.HALF_UP);

        quote.setPrice(newPrice);
        quote.setChange24h(diff);
        quote.setChangePercent24h(percent);
        if (newPrice.compareTo(quote.getHigh24h()) > 0) {
            quote.setHigh24h(newPrice);
        }
        if (newPrice.compareTo(quote.getLow24h()) < 0) {
            quote.setLow24h(newPrice);
        }
        marketQuoteRepository.save(quote);
    }

    public MarketQuoteResponse mapToQuoteResponse(MarketQuote quote) {
        return MarketQuoteResponse.builder()
                .symbol(quote.getAsset().getSymbol())
                .price(quote.getPrice())
                .change24h(quote.getChange24h())
                .changePercent24h(quote.getChangePercent24h())
                .high24h(quote.getHigh24h())
                .low24h(quote.getLow24h())
                .volume24h(quote.getVolume24h())
                .observedAt(quote.getObservedAt())
                .build();
    }

    private record SeedAssetData(
            String symbol,
            String name,
            AssetClass assetClass,
            String exchange,
            BigDecimal price,
            BigDecimal change24h,
            BigDecimal changePercent24h,
            BigDecimal high24h,
            BigDecimal low24h,
            BigDecimal volume24h
    ) {}
}
