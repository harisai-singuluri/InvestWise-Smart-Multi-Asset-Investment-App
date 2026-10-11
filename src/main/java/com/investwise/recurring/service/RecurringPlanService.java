package com.investwise.recurring.service;

import com.investwise.asset.entity.Asset;
import com.investwise.asset.service.AssetService;
import com.investwise.common.exception.ResourceNotFoundException;
import com.investwise.common.exception.UnauthorizedException;
import com.investwise.marketdata.dto.MarketQuoteResponse;
import com.investwise.marketdata.service.MarketDataService;
import com.investwise.order.dto.OrderRequest;
import com.investwise.order.entity.OrderSide;
import com.investwise.order.entity.OrderType;
import com.investwise.order.service.OrderService;
import com.investwise.recurring.dto.RecurringPlanRequest;
import com.investwise.recurring.dto.RecurringPlanResponse;
import com.investwise.recurring.entity.RecurringFrequency;
import com.investwise.recurring.entity.RecurringPlan;
import com.investwise.recurring.entity.RecurringStatus;
import com.investwise.recurring.repository.RecurringPlanRepository;
import com.investwise.user.entity.User;
import com.investwise.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecurringPlanService {

    private final RecurringPlanRepository recurringPlanRepository;
    private final AssetService assetService;
    private final UserService userService;
    private final OrderService orderService;
    private final MarketDataService marketDataService;

    @Transactional
    public RecurringPlanResponse createPlan(Long userId, RecurringPlanRequest request) {
        User user = userService.getUserById(userId);
        Asset asset = assetService.getAssetEntityBySymbol(request.getSymbol());

        LocalDate nextDate = calculateNextDate(LocalDate.now(), request.getFrequency());

        RecurringPlan plan = RecurringPlan.builder()
                .user(user)
                .asset(asset)
                .amount(request.getAmount())
                .frequency(request.getFrequency())
                .nextExecutionDate(nextDate)
                .status(RecurringStatus.ACTIVE)
                .build();

        RecurringPlan saved = recurringPlanRepository.save(plan);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RecurringPlanResponse> getUserPlans(Long userId) {
        return recurringPlanRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RecurringPlanResponse updatePlanStatus(Long userId, Long planId, RecurringStatus newStatus) {
        RecurringPlan plan = recurringPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring plan not found with id: " + planId));

        if (!plan.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to modify this recurring plan");
        }

        plan.setStatus(newStatus);
        if (newStatus == RecurringStatus.ACTIVE && plan.getNextExecutionDate().isBefore(LocalDate.now())) {
            plan.setNextExecutionDate(calculateNextDate(LocalDate.now(), plan.getFrequency()));
        }

        RecurringPlan saved = recurringPlanRepository.save(plan);
        return mapToResponse(saved);
    }

    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void executeScheduledRecurringPlans() {
        List<RecurringPlan> duePlans = recurringPlanRepository.findByStatusAndNextExecutionDateLessThanEqual(
                RecurringStatus.ACTIVE, LocalDate.now());

        for (RecurringPlan plan : duePlans) {
            try {
                MarketQuoteResponse quote = marketDataService.getQuote(plan.getAsset().getSymbol());
                BigDecimal currentPrice = quote.getPrice();
                BigDecimal quantity = plan.getAmount().divide(currentPrice, 6, RoundingMode.HALF_UP);

                OrderRequest orderRequest = OrderRequest.builder()
                        .symbol(plan.getAsset().getSymbol())
                        .side(OrderSide.BUY)
                        .type(OrderType.MARKET)
                        .quantity(quantity)
                        .idempotencyKey("recurring-" + plan.getId() + "-" + LocalDate.now() + "-" + UUID.randomUUID())
                        .build();

                orderService.submitOrder(plan.getUser().getId(), orderRequest);
                plan.setNextExecutionDate(calculateNextDate(plan.getNextExecutionDate(), plan.getFrequency()));
                recurringPlanRepository.save(plan);
            } catch (Exception ignored) {
            }
        }
    }

    private LocalDate calculateNextDate(LocalDate fromDate, RecurringFrequency frequency) {
        return switch (frequency) {
            case DAILY -> fromDate.plusDays(1);
            case WEEKLY -> fromDate.plusWeeks(1);
            case BIWEEKLY -> fromDate.plusWeeks(2);
            case MONTHLY -> fromDate.plusMonths(1);
        };
    }

    private RecurringPlanResponse mapToResponse(RecurringPlan plan) {
        return RecurringPlanResponse.builder()
                .id(plan.getId())
                .userId(plan.getUser().getId())
                .symbol(plan.getAsset().getSymbol())
                .assetName(plan.getAsset().getName())
                .amount(plan.getAmount())
                .frequency(plan.getFrequency())
                .nextExecutionDate(plan.getNextExecutionDate())
                .status(plan.getStatus())
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}
