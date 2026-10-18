package com.investwise.alert.service;

import com.investwise.alert.dto.PriceAlertRequest;
import com.investwise.alert.dto.PriceAlertResponse;
import com.investwise.alert.entity.AlertCondition;
import com.investwise.alert.entity.AlertStatus;
import com.investwise.alert.entity.PriceAlert;
import com.investwise.alert.repository.PriceAlertRepository;
import com.investwise.asset.entity.Asset;
import com.investwise.asset.entity.AssetClass;
import com.investwise.asset.service.AssetService;
import com.investwise.common.exception.DuplicateResourceException;
import com.investwise.marketdata.service.MarketDataService;
import com.investwise.notification.service.NotificationService;
import com.investwise.user.entity.User;
import com.investwise.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PriceAlertServiceTest {

    @Mock
    private PriceAlertRepository priceAlertRepository;

    @Mock
    private AssetService assetService;

    @Mock
    private UserService userService;

    @Mock
    private MarketDataService marketDataService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PriceAlertService priceAlertService;

    private User sampleUser;
    private Asset sampleAsset;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder().id(1L).email("alex@investwise.app").build();
        sampleAsset = Asset.builder().id(2L).symbol("AAPL").name("Apple Inc.").assetClass(AssetClass.STOCKS).build();
    }

    @Test
    void createAlert_Success() {
        PriceAlertRequest request = PriceAlertRequest.builder()
                .symbol("AAPL")
                .alertCondition(AlertCondition.PRICE_ABOVE)
                .thresholdPrice(new BigDecimal("200.0000"))
                .build();

        when(priceAlertRepository.existsByUserIdAndAssetSymbolAndAlertConditionAndThresholdPriceAndStatus(
                1L, "AAPL", AlertCondition.PRICE_ABOVE, new BigDecimal("200.0000"), AlertStatus.ACTIVE)).thenReturn(false);
        when(userService.getUserById(1L)).thenReturn(sampleUser);
        when(assetService.getAssetEntityBySymbol("AAPL")).thenReturn(sampleAsset);
        when(priceAlertRepository.save(any(PriceAlert.class))).thenAnswer(i -> {
            PriceAlert pa = i.getArgument(0);
            pa.setId(99L);
            return pa;
        });

        PriceAlertResponse response = priceAlertService.createAlert(1L, request);

        assertNotNull(response);
        assertEquals(99L, response.getId());
        assertEquals("AAPL", response.getSymbol());
        assertEquals(AlertStatus.ACTIVE, response.getStatus());
    }

    @Test
    void createAlert_Duplicate_ThrowsDuplicateResourceException() {
        PriceAlertRequest request = PriceAlertRequest.builder()
                .symbol("AAPL")
                .alertCondition(AlertCondition.PRICE_ABOVE)
                .thresholdPrice(new BigDecimal("200.0000"))
                .build();

        when(priceAlertRepository.existsByUserIdAndAssetSymbolAndAlertConditionAndThresholdPriceAndStatus(
                1L, "AAPL", AlertCondition.PRICE_ABOVE, new BigDecimal("200.0000"), AlertStatus.ACTIVE)).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> priceAlertService.createAlert(1L, request));
    }
}
