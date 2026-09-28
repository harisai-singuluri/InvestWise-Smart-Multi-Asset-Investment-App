package com.investwise.portfolio.service;

import com.investwise.account.entity.Account;
import com.investwise.account.service.AccountService;
import com.investwise.asset.entity.Asset;
import com.investwise.asset.entity.AssetClass;
import com.investwise.marketdata.dto.MarketQuoteResponse;
import com.investwise.marketdata.service.MarketDataService;
import com.investwise.portfolio.dto.PortfolioSummaryResponse;
import com.investwise.portfolio.entity.Holding;
import com.investwise.portfolio.repository.HoldingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PortfolioServiceTest {

    @Mock
    private HoldingRepository holdingRepository;

    @Mock
    private AccountService accountService;

    @Mock
    private MarketDataService marketDataService;

    @InjectMocks
    private PortfolioService portfolioService;

    private Account sampleAccount;
    private Asset sampleAsset;
    private Holding sampleHolding;

    @BeforeEach
    void setUp() {
        sampleAccount = Account.builder()
                .totalBalance(new BigDecimal("50000.0000"))
                .availableCash(new BigDecimal("50000.0000"))
                .reservedCash(BigDecimal.ZERO)
                .build();

        sampleAsset = Asset.builder()
                .symbol("AAPL")
                .name("Apple Inc.")
                .assetClass(AssetClass.STOCKS)
                .build();

        sampleHolding = Holding.builder()
                .asset(sampleAsset)
                .quantity(new BigDecimal("100.000000"))
                .averageCost(new BigDecimal("150.0000"))
                .build();
    }

    @Test
    void getPortfolioSummary_CalculatesAccurately() {
        when(accountService.getAccountByUserId(1L)).thenReturn(sampleAccount);
        when(holdingRepository.findByUserId(1L)).thenReturn(List.of(sampleHolding));

        MarketQuoteResponse quote = MarketQuoteResponse.builder()
                .symbol("AAPL")
                .price(new BigDecimal("200.0000"))
                .build();
        when(marketDataService.getQuote("AAPL")).thenReturn(quote);

        PortfolioSummaryResponse summary = portfolioService.getPortfolioSummary(1L);

        assertNotNull(summary);
        assertEquals(new BigDecimal("70000.0000"), summary.getTotalPortfolioValue());
        assertEquals(new BigDecimal("15000.0000"), summary.getTotalInvested());
        assertEquals(new BigDecimal("5000.0000"), summary.getTotalUnrealizedPnL());
    }
}
