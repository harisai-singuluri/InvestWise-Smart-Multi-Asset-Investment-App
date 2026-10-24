package com.investwise.config;

import com.investwise.account.service.AccountService;
import com.investwise.alert.entity.AlertCondition;
import com.investwise.alert.entity.PriceAlert;
import com.investwise.alert.repository.PriceAlertRepository;
import com.investwise.asset.entity.Asset;
import com.investwise.asset.repository.AssetRepository;
import com.investwise.goal.entity.GoalStatus;
import com.investwise.goal.entity.InvestmentGoal;
import com.investwise.goal.entity.RiskProfile;
import com.investwise.goal.repository.GoalRepository;
import com.investwise.order.dto.OrderRequest;
import com.investwise.order.entity.OrderSide;
import com.investwise.order.entity.OrderType;
import com.investwise.order.service.OrderService;
import com.investwise.recurring.entity.RecurringFrequency;
import com.investwise.recurring.entity.RecurringPlan;
import com.investwise.recurring.entity.RecurringStatus;
import com.investwise.recurring.repository.RecurringPlanRepository;
import com.investwise.user.entity.Role;
import com.investwise.user.entity.User;
import com.investwise.user.repository.UserRepository;
import com.investwise.watchlist.entity.WatchlistItem;
import com.investwise.watchlist.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Component
@Order(100)
@RequiredArgsConstructor
public class DemoDataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final AccountService accountService;
    private final PasswordEncoder passwordEncoder;
    private final OrderService orderService;
    private final AssetRepository assetRepository;
    private final GoalRepository goalRepository;
    private final RecurringPlanRepository recurringPlanRepository;
    private final WatchlistRepository watchlistRepository;
    private final PriceAlertRepository priceAlertRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.findByEmail("alex@investwise.app").isPresent()) {
            return;
        }

        User user = User.builder()
                .email("alex@investwise.app")
                .fullName("Alex Morgan")
                .passwordHash(passwordEncoder.encode("InvestWise123!"))
                .role(Role.ROLE_USER)
                .build();

        User savedUser = userRepository.save(user);
        accountService.createDemoAccount(savedUser);

        seedDemoOrders(savedUser.getId());
        seedDemoGoals(savedUser);
        seedDemoRecurringPlans(savedUser);
        seedDemoWatchlist(savedUser);
        seedDemoAlerts(savedUser);
    }

    private void seedDemoOrders(Long userId) {
        placeMarketOrder(userId, "AAPL", new BigDecimal("15"));
        placeMarketOrder(userId, "SPY", new BigDecimal("10"));
        placeMarketOrder(userId, "BTC", new BigDecimal("0.25"));
        placeMarketOrder(userId, "XAU", new BigDecimal("25"));
        placeMarketOrder(userId, "QQQ", new BigDecimal("8"));
    }

    private void placeMarketOrder(Long userId, String symbol, BigDecimal quantity) {
        try {
            OrderRequest request = OrderRequest.builder()
                    .symbol(symbol)
                    .side(OrderSide.BUY)
                    .type(OrderType.MARKET)
                    .quantity(quantity)
                    .idempotencyKey("seed-" + symbol + "-" + UUID.randomUUID())
                    .build();
            orderService.submitOrder(userId, request);
        } catch (Exception ignored) {
        }
    }

    private void seedDemoGoals(User user) {
        InvestmentGoal goal1 = InvestmentGoal.builder()
                .user(user)
                .title("House Down Payment 2028")
                .targetAmount(new BigDecimal("60000.00"))
                .currentAmount(new BigDecimal("18500.00"))
                .targetDate(LocalDate.now().plusYears(3))
                .riskProfile(RiskProfile.MODERATE)
                .status(GoalStatus.ACTIVE)
                .build();
        goalRepository.save(goal1);

        InvestmentGoal goal2 = InvestmentGoal.builder()
                .user(user)
                .title("Retirement Wealth Builder")
                .targetAmount(new BigDecimal("250000.00"))
                .currentAmount(new BigDecimal("35000.00"))
                .targetDate(LocalDate.now().plusYears(15))
                .riskProfile(RiskProfile.AGGRESSIVE)
                .status(GoalStatus.ACTIVE)
                .build();
        goalRepository.save(goal2);
    }

    private void seedDemoRecurringPlans(User user) {
        Optional<Asset> spy = assetRepository.findBySymbol("SPY");
        spy.ifPresent(asset -> {
            RecurringPlan plan = RecurringPlan.builder()
                    .user(user)
                    .asset(asset)
                    .amount(new BigDecimal("250.00"))
                    .frequency(RecurringFrequency.WEEKLY)
                    .nextExecutionDate(LocalDate.now().plusDays(7))
                    .status(RecurringStatus.ACTIVE)
                    .build();
            recurringPlanRepository.save(plan);
        });

        Optional<Asset> btc = assetRepository.findBySymbol("BTC");
        btc.ifPresent(asset -> {
            RecurringPlan plan = RecurringPlan.builder()
                    .user(user)
                    .asset(asset)
                    .amount(new BigDecimal("100.00"))
                    .frequency(RecurringFrequency.MONTHLY)
                    .nextExecutionDate(LocalDate.now().plusDays(14))
                    .status(RecurringStatus.ACTIVE)
                    .build();
            recurringPlanRepository.save(plan);
        });
    }

    private void seedDemoWatchlist(User user) {
        addWatchlistAsset(user, "NVDA");
        addWatchlistAsset(user, "ETH");
        addWatchlistAsset(user, "MSFT");
    }

    private void addWatchlistAsset(User user, String symbol) {
        assetRepository.findBySymbol(symbol).ifPresent(asset -> {
            WatchlistItem item = WatchlistItem.builder()
                    .user(user)
                    .asset(asset)
                    .build();
            watchlistRepository.save(item);
        });
    }

    private void seedDemoAlerts(User user) {
        assetRepository.findBySymbol("BTC").ifPresent(asset -> {
            PriceAlert alert = PriceAlert.builder()
                    .user(user)
                    .asset(asset)
                    .alertCondition(AlertCondition.PRICE_ABOVE)
                    .thresholdPrice(new BigDecimal("70000.00"))
                    .build();
            priceAlertRepository.save(alert);
        });

        assetRepository.findBySymbol("AAPL").ifPresent(asset -> {
            PriceAlert alert = PriceAlert.builder()
                    .user(user)
                    .asset(asset)
                    .alertCondition(AlertCondition.PRICE_BELOW)
                    .thresholdPrice(new BigDecimal("175.00"))
                    .build();
            priceAlertRepository.save(alert);
        });
    }
}
