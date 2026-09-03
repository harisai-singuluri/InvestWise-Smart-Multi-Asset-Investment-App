package com.investwise.order.service;

import com.investwise.account.entity.Account;
import com.investwise.account.service.AccountService;
import com.investwise.asset.entity.Asset;
import com.investwise.asset.service.AssetService;
import com.investwise.common.exception.BadRequestException;
import com.investwise.common.exception.InsufficientHoldingsException;
import com.investwise.common.exception.InvalidOrderStateException;
import com.investwise.common.exception.ResourceNotFoundException;
import com.investwise.common.exception.UnauthorizedException;
import com.investwise.ledger.service.LedgerService;
import com.investwise.marketdata.dto.MarketQuoteResponse;
import com.investwise.marketdata.service.MarketDataService;
import com.investwise.order.dto.OrderRequest;
import com.investwise.order.dto.OrderResponse;
import com.investwise.order.entity.Order;
import com.investwise.order.entity.OrderSide;
import com.investwise.order.entity.OrderStatus;
import com.investwise.order.entity.OrderType;
import com.investwise.order.repository.OrderRepository;
import com.investwise.portfolio.entity.Holding;
import com.investwise.portfolio.repository.HoldingRepository;
import com.investwise.user.entity.User;
import com.investwise.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final HoldingRepository holdingRepository;
    private final AssetService assetService;
    private final MarketDataService marketDataService;
    private final AccountService accountService;
    private final LedgerService ledgerService;
    private final UserService userService;
    private final FeeScheduleService feeScheduleService;

    @Transactional
    public OrderResponse submitOrder(Long userId, OrderRequest request) {
        String idempotencyKey = request.getIdempotencyKey();
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<Order> existingOrder = orderRepository.findByIdempotencyKey(idempotencyKey);
            if (existingOrder.isPresent()) {
                return mapToOrderResponse(existingOrder.get());
            }
        } else {
            idempotencyKey = UUID.randomUUID().toString();
        }

        User user = userService.getUserById(userId);
        Asset asset = assetService.getAssetEntityBySymbol(request.getSymbol());
        MarketQuoteResponse quote = marketDataService.getQuote(asset.getSymbol());

        if (request.getType() == OrderType.LIMIT) {
            if (request.getLimitPrice() == null || request.getLimitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Limit price must be greater than zero for limit orders");
            }
        }

        if (request.getType() == OrderType.STOP_LOSS || request.getType() == OrderType.TAKE_PROFIT) {
            if (request.getTriggerPrice() == null || request.getTriggerPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Trigger price must be greater than zero for stop loss and take profit orders");
            }
        }

        if (request.getSide() == OrderSide.BUY) {
            return processBuyOrder(user, asset, quote, request, idempotencyKey);
        } else {
            return processSellOrder(user, asset, quote, request, idempotencyKey);
        }
    }

    private OrderResponse processBuyOrder(User user, Asset asset, MarketQuoteResponse quote, OrderRequest request, String idempotencyKey) {
        if (request.getType() == OrderType.MARKET) {
            BigDecimal executionPrice = feeScheduleService.calculateExecutionPrice(quote.getPrice(), OrderSide.BUY, OrderType.MARKET, asset.getAssetClass());
            BigDecimal notionalAmount = request.getQuantity().multiply(executionPrice).setScale(4, RoundingMode.HALF_UP);
            BigDecimal fee = feeScheduleService.calculateFee(notionalAmount, asset.getAssetClass());
            BigDecimal totalCashRequired = notionalAmount.add(fee);

            Account updatedAccount = accountService.debitAvailableCash(user.getId(), totalCashRequired);

            Order order = Order.builder()
                    .user(user)
                    .asset(asset)
                    .side(OrderSide.BUY)
                    .type(OrderType.MARKET)
                    .quantity(request.getQuantity())
                    .filledPrice(executionPrice)
                    .fee(fee)
                    .status(OrderStatus.FILLED)
                    .idempotencyKey(idempotencyKey)
                    .build();
            Order savedOrder = orderRepository.save(order);

            ledgerService.recordExecution(savedOrder, user, asset, OrderSide.BUY, request.getQuantity(),
                    executionPrice, notionalAmount, fee, updatedAccount.getAvailableCash());

            updateHoldingOnBuy(user, asset, request.getQuantity(), executionPrice, notionalAmount);

            return mapToOrderResponse(savedOrder);
        } else {
            BigDecimal limitPrice = request.getLimitPrice();
            BigDecimal reservationAmount = request.getQuantity().multiply(limitPrice).setScale(4, RoundingMode.HALF_UP);
            BigDecimal estimatedFee = feeScheduleService.calculateFee(reservationAmount, asset.getAssetClass());
            BigDecimal totalReservation = reservationAmount.add(estimatedFee);

            accountService.reserveCash(user.getId(), totalReservation);

            Order order = Order.builder()
                    .user(user)
                    .asset(asset)
                    .side(OrderSide.BUY)
                    .type(OrderType.LIMIT)
                    .quantity(request.getQuantity())
                    .limitPrice(limitPrice)
                    .fee(estimatedFee)
                    .status(OrderStatus.OPEN)
                    .idempotencyKey(idempotencyKey)
                    .build();
            Order savedOrder = orderRepository.save(order);

            return mapToOrderResponse(savedOrder);
        }
    }

    private OrderResponse processSellOrder(User user, Asset asset, MarketQuoteResponse quote, OrderRequest request, String idempotencyKey) {
        Holding holding = holdingRepository.findByUserIdAndAssetIdWithLock(user.getId(), asset.getId())
                .orElseThrow(() -> new InsufficientHoldingsException("You do not own any shares of " + asset.getSymbol()));

        if (holding.getQuantity().compareTo(request.getQuantity()) < 0) {
            throw new InsufficientHoldingsException("Insufficient holdings. Available: " +
                    holding.getQuantity() + ", Requested: " + request.getQuantity());
        }

        if (request.getType() == OrderType.MARKET) {
            BigDecimal executionPrice = feeScheduleService.calculateExecutionPrice(quote.getPrice(), OrderSide.SELL, OrderType.MARKET, asset.getAssetClass());
            BigDecimal notionalAmount = request.getQuantity().multiply(executionPrice).setScale(4, RoundingMode.HALF_UP);
            BigDecimal fee = feeScheduleService.calculateFee(notionalAmount, asset.getAssetClass());
            BigDecimal netProceeds = notionalAmount.subtract(fee);

            Account updatedAccount = accountService.creditCash(user.getId(), netProceeds);

            Order order = Order.builder()
                    .user(user)
                    .asset(asset)
                    .side(OrderSide.SELL)
                    .type(OrderType.MARKET)
                    .quantity(request.getQuantity())
                    .filledPrice(executionPrice)
                    .fee(fee)
                    .status(OrderStatus.FILLED)
                    .idempotencyKey(idempotencyKey)
                    .build();
            Order savedOrder = orderRepository.save(order);

            ledgerService.recordExecution(savedOrder, user, asset, OrderSide.SELL, request.getQuantity(),
                    executionPrice, notionalAmount, fee, updatedAccount.getAvailableCash());

            updateHoldingOnSell(holding, request.getQuantity());

            return mapToOrderResponse(savedOrder);
        } else {
            Order order = Order.builder()
                    .user(user)
                    .asset(asset)
                    .side(OrderSide.SELL)
                    .type(request.getType())
                    .quantity(request.getQuantity())
                    .limitPrice(request.getLimitPrice())
                    .triggerPrice(request.getTriggerPrice())
                    .status(OrderStatus.OPEN)
                    .idempotencyKey(idempotencyKey)
                    .build();
            Order savedOrder = orderRepository.save(order);

            return mapToOrderResponse(savedOrder);
        }
    }

    private void updateHoldingOnBuy(User user, Asset asset, BigDecimal buyQuantity, BigDecimal executionPrice, BigDecimal totalAmount) {
        Optional<Holding> optionalHolding = holdingRepository.findByUserIdAndAssetIdWithLock(user.getId(), asset.getId());
        if (optionalHolding.isPresent()) {
            Holding holding = optionalHolding.get();
            BigDecimal oldQuantity = holding.getQuantity();
            BigDecimal oldAverageCost = holding.getAverageCost();
            BigDecimal oldTotalCost = oldQuantity.multiply(oldAverageCost);

            BigDecimal newQuantity = oldQuantity.add(buyQuantity);
            BigDecimal newAverageCost = oldTotalCost.add(totalAmount).divide(newQuantity, 4, RoundingMode.HALF_UP);

            holding.setQuantity(newQuantity);
            holding.setAverageCost(newAverageCost);
            holdingRepository.save(holding);
        } else {
            Holding holding = Holding.builder()
                    .user(user)
                    .asset(asset)
                    .quantity(buyQuantity)
                    .averageCost(executionPrice)
                    .build();
            holdingRepository.save(holding);
        }
    }

    private void updateHoldingOnSell(Holding holding, BigDecimal sellQuantity) {
        BigDecimal remainingQuantity = holding.getQuantity().subtract(sellQuantity);
        if (remainingQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            holdingRepository.delete(holding);
        } else {
            holding.setQuantity(remainingQuantity);
            holdingRepository.save(holding);
        }
    }

    @Transactional
    public OrderResponse cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to cancel this order");
        }

        if (order.getStatus() != OrderStatus.OPEN) {
            throw new InvalidOrderStateException("Only OPEN orders can be cancelled. Current status: " + order.getStatus());
        }

        if (order.getSide() == OrderSide.BUY && order.getType() == OrderType.LIMIT) {
            BigDecimal notional = order.getQuantity().multiply(order.getLimitPrice()).setScale(4, RoundingMode.HALF_UP);
            BigDecimal fee = feeScheduleService.calculateFee(notional, order.getAsset().getAssetClass());
            BigDecimal amountToRelease = notional.add(fee);
            accountService.releaseReservedCash(userId, amountToRelease);
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);
        return mapToOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(Long userId, OrderStatus status) {
        List<Order> orders = (status != null) ?
                orderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status) :
                orderRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void evaluateOpenLimitOrders() {
        List<Order> openOrders = orderRepository.findByStatus(OrderStatus.OPEN);
        for (Order order : openOrders) {
            try {
                MarketQuoteResponse quote = marketDataService.getQuote(order.getAsset().getSymbol());
                BigDecimal currentPrice = quote.getPrice();

                if (order.getType() == OrderType.LIMIT) {
                    if (order.getSide() == OrderSide.BUY && currentPrice.compareTo(order.getLimitPrice()) <= 0) {
                        executeLimitBuy(order, currentPrice);
                    } else if (order.getSide() == OrderSide.SELL && currentPrice.compareTo(order.getLimitPrice()) >= 0) {
                        executeLimitSell(order, currentPrice);
                    }
                } else if (order.getType() == OrderType.STOP_LOSS) {
                    if (order.getSide() == OrderSide.SELL && currentPrice.compareTo(order.getTriggerPrice()) <= 0) {
                        executeLimitSell(order, currentPrice);
                    }
                } else if (order.getType() == OrderType.TAKE_PROFIT) {
                    if (order.getSide() == OrderSide.SELL && currentPrice.compareTo(order.getTriggerPrice()) >= 0) {
                        executeLimitSell(order, currentPrice);
                    }
                }
            } catch (Exception ignored) {
            }
        }
    }

    private void executeLimitBuy(Order order, BigDecimal executionPrice) {
        BigDecimal notionalAmount = order.getQuantity().multiply(executionPrice).setScale(4, RoundingMode.HALF_UP);
        BigDecimal fee = feeScheduleService.calculateFee(notionalAmount, order.getAsset().getAssetClass());
        BigDecimal totalRequired = notionalAmount.add(fee);

        BigDecimal reservedNotional = order.getQuantity().multiply(order.getLimitPrice()).setScale(4, RoundingMode.HALF_UP);
        BigDecimal reservedFee = feeScheduleService.calculateFee(reservedNotional, order.getAsset().getAssetClass());
        BigDecimal totalReserved = reservedNotional.add(reservedFee);

        Account account = accountService.debitReservedCash(order.getUser().getId(), totalRequired);
        if (totalReserved.compareTo(totalRequired) > 0) {
            accountService.releaseReservedCash(order.getUser().getId(), totalReserved.subtract(totalRequired));
        }

        order.setStatus(OrderStatus.FILLED);
        order.setFilledPrice(executionPrice);
        order.setFee(fee);
        orderRepository.save(order);

        ledgerService.recordExecution(order, order.getUser(), order.getAsset(), OrderSide.BUY,
                order.getQuantity(), executionPrice, notionalAmount, fee, account.getAvailableCash());

        updateHoldingOnBuy(order.getUser(), order.getAsset(), order.getQuantity(), executionPrice, notionalAmount);
    }

    private void executeLimitSell(Order order, BigDecimal executionPrice) {
        Optional<Holding> optionalHolding = holdingRepository.findByUserIdAndAssetIdWithLock(order.getUser().getId(), order.getAsset().getId());
        if (optionalHolding.isEmpty() || optionalHolding.get().getQuantity().compareTo(order.getQuantity()) < 0) {
            order.setStatus(OrderStatus.REJECTED);
            order.setFailureReason("Insufficient holdings at execution time");
            orderRepository.save(order);
            return;
        }

        BigDecimal notionalAmount = order.getQuantity().multiply(executionPrice).setScale(4, RoundingMode.HALF_UP);
        BigDecimal fee = feeScheduleService.calculateFee(notionalAmount, order.getAsset().getAssetClass());
        BigDecimal netProceeds = notionalAmount.subtract(fee);

        Account account = accountService.creditCash(order.getUser().getId(), netProceeds);

        order.setStatus(OrderStatus.FILLED);
        order.setFilledPrice(executionPrice);
        order.setFee(fee);
        orderRepository.save(order);

        ledgerService.recordExecution(order, order.getUser(), order.getAsset(), OrderSide.SELL,
                order.getQuantity(), executionPrice, notionalAmount, fee, account.getAvailableCash());

        updateHoldingOnSell(optionalHolding.get(), order.getQuantity());
    }

    public OrderResponse mapToOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .symbol(order.getAsset().getSymbol())
                .assetName(order.getAsset().getName())
                .side(order.getSide())
                .type(order.getType())
                .quantity(order.getQuantity())
                .limitPrice(order.getLimitPrice())
                .triggerPrice(order.getTriggerPrice())
                .filledPrice(order.getFilledPrice())
                .fee(order.getFee())
                .status(order.getStatus())
                .idempotencyKey(order.getIdempotencyKey())
                .failureReason(order.getFailureReason())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
