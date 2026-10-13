package com.investwise.watchlist.service;

import com.investwise.asset.dto.AssetResponse;
import com.investwise.asset.entity.Asset;
import com.investwise.asset.service.AssetService;
import com.investwise.common.exception.DuplicateResourceException;
import com.investwise.common.exception.ResourceNotFoundException;
import com.investwise.marketdata.dto.MarketQuoteResponse;
import com.investwise.marketdata.service.MarketDataService;
import com.investwise.user.entity.User;
import com.investwise.user.service.UserService;
import com.investwise.watchlist.entity.WatchlistItem;
import com.investwise.watchlist.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final AssetService assetService;
    private final UserService userService;
    private final MarketDataService marketDataService;

    @Transactional(readOnly = true)
    public List<AssetResponse> getUserWatchlist(Long userId) {
        List<WatchlistItem> items = watchlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return items.stream()
                .map(item -> {
                    Asset asset = item.getAsset();
                    MarketQuoteResponse quote = marketDataService.getQuote(asset.getSymbol());
                    return AssetResponse.builder()
                            .id(asset.getId())
                            .symbol(asset.getSymbol())
                            .name(asset.getName())
                            .assetClass(asset.getAssetClass())
                            .currency(asset.getCurrency())
                            .exchange(asset.getExchange())
                            .active(asset.isActive())
                            .quote(quote)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public AssetResponse addToWatchlist(Long userId, String symbol) {
        if (watchlistRepository.existsByUserIdAndAssetSymbol(userId, symbol.toUpperCase())) {
            throw new DuplicateResourceException(symbol + " is already in your watchlist");
        }

        User user = userService.getUserById(userId);
        Asset asset = assetService.getAssetEntityBySymbol(symbol);

        WatchlistItem item = WatchlistItem.builder()
                .user(user)
                .asset(asset)
                .build();
        watchlistRepository.save(item);

        return assetService.getAssetBySymbol(symbol);
    }

    @Transactional
    public void removeFromWatchlist(Long userId, String symbol) {
        if (!watchlistRepository.existsByUserIdAndAssetSymbol(userId, symbol.toUpperCase())) {
            throw new ResourceNotFoundException(symbol + " was not found in your watchlist");
        }
        watchlistRepository.deleteByUserIdAndAssetSymbol(userId, symbol.toUpperCase());
    }
}
