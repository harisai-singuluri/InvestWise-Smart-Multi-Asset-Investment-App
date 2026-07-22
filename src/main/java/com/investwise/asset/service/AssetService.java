package com.investwise.asset.service;

import com.investwise.asset.dto.AssetResponse;
import com.investwise.asset.entity.Asset;
import com.investwise.asset.entity.AssetClass;
import com.investwise.asset.repository.AssetRepository;
import com.investwise.common.exception.ResourceNotFoundException;
import com.investwise.marketdata.dto.MarketQuoteResponse;
import com.investwise.marketdata.entity.MarketQuote;
import com.investwise.marketdata.repository.MarketQuoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final MarketQuoteRepository marketQuoteRepository;

    @Transactional(readOnly = true)
    public List<AssetResponse> getAssets(AssetClass assetClass, String search) {
        List<Asset> assets;
        if (assetClass != null && search != null && !search.isBlank()) {
            assets = assetRepository.searchAssetsByClass(assetClass, search.trim());
        } else if (assetClass != null) {
            assets = assetRepository.findByAssetClassAndActiveTrue(assetClass);
        } else if (search != null && !search.isBlank()) {
            assets = assetRepository.searchAssets(search.trim());
        } else {
            assets = assetRepository.findByActiveTrue();
        }

        Map<Long, MarketQuote> quoteMap = marketQuoteRepository.findAll().stream()
                .collect(Collectors.toMap(q -> q.getAsset().getId(), q -> q, (a, b) -> a));

        return assets.stream()
                .map(a -> mapToAssetResponse(a, quoteMap.get(a.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssetResponse getAssetBySymbol(String symbol) {
        Asset asset = assetRepository.findBySymbol(symbol.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with symbol: " + symbol));

        MarketQuote quote = marketQuoteRepository.findByAsset(asset)
                .orElse(null);

        return mapToAssetResponse(asset, quote);
    }

    @Transactional(readOnly = true)
    public Asset getAssetEntityBySymbol(String symbol) {
        return assetRepository.findBySymbol(symbol.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with symbol: " + symbol));
    }

    private AssetResponse mapToAssetResponse(Asset asset, MarketQuote quote) {
        MarketQuoteResponse quoteResponse = null;
        if (quote != null) {
            quoteResponse = MarketQuoteResponse.builder()
                    .symbol(asset.getSymbol())
                    .price(quote.getPrice())
                    .change24h(quote.getChange24h())
                    .changePercent24h(quote.getChangePercent24h())
                    .high24h(quote.getHigh24h())
                    .low24h(quote.getLow24h())
                    .volume24h(quote.getVolume24h())
                    .observedAt(quote.getObservedAt())
                    .build();
        }

        return AssetResponse.builder()
                .id(asset.getId())
                .symbol(asset.getSymbol())
                .name(asset.getName())
                .assetClass(asset.getAssetClass())
                .currency(asset.getCurrency())
                .exchange(asset.getExchange())
                .active(asset.isActive())
                .quote(quoteResponse)
                .build();
    }
}
