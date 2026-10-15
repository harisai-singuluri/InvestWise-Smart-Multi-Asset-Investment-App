package com.investwise.alert.service;

import com.investwise.alert.dto.PriceAlertRequest;
import com.investwise.alert.dto.PriceAlertResponse;
import com.investwise.alert.entity.AlertCondition;
import com.investwise.alert.entity.AlertStatus;
import com.investwise.alert.entity.PriceAlert;
import com.investwise.alert.repository.PriceAlertRepository;
import com.investwise.asset.entity.Asset;
import com.investwise.asset.service.AssetService;
import com.investwise.common.exception.DuplicateResourceException;
import com.investwise.common.exception.ResourceNotFoundException;
import com.investwise.common.exception.UnauthorizedException;
import com.investwise.marketdata.dto.MarketQuoteResponse;
import com.investwise.marketdata.service.MarketDataService;
import com.investwise.notification.entity.NotificationType;
import com.investwise.notification.service.NotificationService;
import com.investwise.user.entity.User;
import com.investwise.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PriceAlertService {

    private final PriceAlertRepository priceAlertRepository;
    private final AssetService assetService;
    private final UserService userService;
    private final MarketDataService marketDataService;
    private final NotificationService notificationService;

    @Transactional
    public PriceAlertResponse createAlert(Long userId, PriceAlertRequest request) {
        String symbol = request.getSymbol().toUpperCase().trim();
        if (priceAlertRepository.existsByUserIdAndAssetSymbolAndAlertConditionAndThresholdPriceAndStatus(
                userId, symbol, request.getAlertCondition(), request.getThresholdPrice(), AlertStatus.ACTIVE)) {
            throw new DuplicateResourceException("An identical active price alert already exists for " + symbol);
        }

        User user = userService.getUserById(userId);
        Asset asset = assetService.getAssetEntityBySymbol(symbol);

        PriceAlert alert = PriceAlert.builder()
                .user(user)
                .asset(asset)
                .alertCondition(request.getAlertCondition())
                .thresholdPrice(request.getThresholdPrice())
                .status(AlertStatus.ACTIVE)
                .build();

        PriceAlert saved = priceAlertRepository.save(alert);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PriceAlertResponse> getUserAlerts(Long userId) {
        return priceAlertRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAlert(Long userId, Long alertId) {
        PriceAlert alert = priceAlertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Price alert not found with id: " + alertId));

        if (!alert.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to delete this alert");
        }

        priceAlertRepository.delete(alert);
    }

    @Scheduled(fixedDelay = 10000)
    @Transactional
    public void evaluateActiveAlerts() {
        List<PriceAlert> activeAlerts = priceAlertRepository.findByStatus(AlertStatus.ACTIVE);

        for (PriceAlert alert : activeAlerts) {
            try {
                MarketQuoteResponse quote = marketDataService.getQuote(alert.getAsset().getSymbol());
                BigDecimal currentPrice = quote.getPrice();
                boolean triggered = false;

                if (alert.getAlertCondition() == AlertCondition.PRICE_ABOVE && currentPrice.compareTo(alert.getThresholdPrice()) >= 0) {
                    triggered = true;
                } else if (alert.getAlertCondition() == AlertCondition.PRICE_BELOW && currentPrice.compareTo(alert.getThresholdPrice()) <= 0) {
                    triggered = true;
                }

                if (triggered) {
                    alert.setStatus(AlertStatus.TRIGGERED);
                    alert.setTriggeredAt(Instant.now());
                    priceAlertRepository.save(alert);

                    String msg = String.format("Price alert triggered: %s is now at $%s (Target: $%s)",
                            alert.getAsset().getSymbol(), currentPrice, alert.getThresholdPrice());
                    notificationService.createNotification(alert.getUser(), "Price Alert Triggered", msg, NotificationType.PRICE_ALERT);
                }
            } catch (Exception ignored) {
            }
        }
    }

    private PriceAlertResponse mapToResponse(PriceAlert alert) {
        return PriceAlertResponse.builder()
                .id(alert.getId())
                .userId(alert.getUser().getId())
                .symbol(alert.getAsset().getSymbol())
                .assetName(alert.getAsset().getName())
                .alertCondition(alert.getAlertCondition())
                .thresholdPrice(alert.getThresholdPrice())
                .status(alert.getStatus())
                .triggeredAt(alert.getTriggeredAt())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
