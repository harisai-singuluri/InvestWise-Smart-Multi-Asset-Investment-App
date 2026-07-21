package com.investwise.asset.dto;

import com.investwise.asset.entity.AssetClass;
import com.investwise.marketdata.dto.MarketQuoteResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetResponse {
    private Long id;
    private String symbol;
    private String name;
    private AssetClass assetClass;
    private String currency;
    private String exchange;
    private boolean active;
    private MarketQuoteResponse quote;
}
