package com.investwise.marketdata.repository;

import com.investwise.asset.entity.Asset;
import com.investwise.marketdata.entity.MarketQuote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MarketQuoteRepository extends JpaRepository<MarketQuote, Long> {
    Optional<MarketQuote> findByAsset(Asset asset);
    Optional<MarketQuote> findByAssetSymbol(String symbol);
}
