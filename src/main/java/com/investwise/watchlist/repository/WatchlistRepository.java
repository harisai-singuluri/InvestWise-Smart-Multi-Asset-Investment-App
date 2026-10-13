package com.investwise.watchlist.repository;

import com.investwise.watchlist.entity.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<WatchlistItem, Long> {

    List<WatchlistItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<WatchlistItem> findByUserIdAndAssetSymbol(Long userId, String symbol);

    boolean existsByUserIdAndAssetSymbol(Long userId, String symbol);

    void deleteByUserIdAndAssetSymbol(Long userId, String symbol);

    void deleteByUserId(Long userId);
}
