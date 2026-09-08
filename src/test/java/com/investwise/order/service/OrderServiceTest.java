package com.investwise.order.service;

import com.investwise.account.entity.Account;
import com.investwise.account.service.AccountService;
import com.investwise.asset.entity.Asset;
import com.investwise.asset.entity.AssetClass;
import com.investwise.asset.service.AssetService;
import com.investwise.common.exception.InsufficientHoldingsException;
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
import com.investwise.user.entity.Role;
import com.investwise.user.entity.User;
import com.investwise.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private HoldingRepository holdingRepository;

    @Mock
    private AssetService assetService;

    @Mock
    private MarketDataService marketDataService;

    @Mock
    private AccountService accountService;

    @Mock
    private LedgerService ledgerService;

    @Mock
    private UserService userService;

    @Mock
    private FeeScheduleService feeScheduleService;

    @InjectMocks
    private OrderService orderService;

    private User sampleUser;
    private Asset sampleAsset;
    private MarketQuoteResponse sampleQuote;
    private Account sampleAccount;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .email("alex@investwise.app")
                .fullName("Alex Chen")
                .role(Role.ROLE_USER)
                .build();

        sampleAsset = Asset.builder()
                .id(10L)
                .symbol("AAPL")
                .name("Apple Inc.")
                .assetClass(AssetClass.STOCKS)
                .build();

        sampleQuote = MarketQuoteResponse.builder()
                .symbol("AAPL")
                .price(new BigDecimal("180.0000"))
                .build();

        sampleAccount = Account.builder()
                .id(100L)
                .user(sampleUser)
                .totalBalance(new BigDecimal("100000.0000"))
                .availableCash(new BigDecimal("100000.0000"))
                .reservedCash(BigDecimal.ZERO)
                .build();
    }

    @Test
    void submitOrder_MarketBuy_Success() {
        OrderRequest request = OrderRequest.builder()
                .symbol("AAPL")
                .side(OrderSide.BUY)
                .type(OrderType.MARKET)
                .quantity(new BigDecimal("10.000000"))
                .build();

        when(userService.getUserById(1L)).thenReturn(sampleUser);
        when(assetService.getAssetEntityBySymbol("AAPL")).thenReturn(sampleAsset);
        when(marketDataService.getQuote("AAPL")).thenReturn(sampleQuote);
        when(feeScheduleService.calculateExecutionPrice(any(), eq(OrderSide.BUY), eq(OrderType.MARKET), eq(AssetClass.STOCKS)))
                .thenReturn(new BigDecimal("180.0000"));
        when(feeScheduleService.calculateFee(any(), eq(AssetClass.STOCKS))).thenReturn(new BigDecimal("0.9000"));
        when(accountService.debitAvailableCash(eq(1L), any(BigDecimal.class))).thenReturn(sampleAccount);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(500L);
            return o;
        });

        OrderResponse response = orderService.submitOrder(1L, request);

        assertNotNull(response);
        assertEquals(OrderStatus.FILLED, response.getStatus());
        assertEquals(new BigDecimal("180.0000"), response.getFilledPrice());
        verify(ledgerService).recordExecution(any(), eq(sampleUser), eq(sampleAsset), eq(OrderSide.BUY), any(), any(), any(), any(), any());
    }

    @Test
    void submitOrder_IdempotencyKey_ReturnsExistingOrder() {
        Order existingOrder = Order.builder()
                .id(999L)
                .user(sampleUser)
                .asset(sampleAsset)
                .side(OrderSide.BUY)
                .type(OrderType.MARKET)
                .quantity(new BigDecimal("5.000000"))
                .status(OrderStatus.FILLED)
                .idempotencyKey("idem-key-123")
                .build();

        when(orderRepository.findByIdempotencyKey("idem-key-123")).thenReturn(Optional.of(existingOrder));

        OrderRequest request = OrderRequest.builder()
                .symbol("AAPL")
                .side(OrderSide.BUY)
                .type(OrderType.MARKET)
                .quantity(new BigDecimal("5.000000"))
                .idempotencyKey("idem-key-123")
                .build();

        OrderResponse response = orderService.submitOrder(1L, request);

        assertNotNull(response);
        assertEquals(999L, response.getId());
        assertEquals("idem-key-123", response.getIdempotencyKey());
    }

    @Test
    void submitOrder_MarketSell_InsufficientHoldings_ThrowsException() {
        OrderRequest request = OrderRequest.builder()
                .symbol("AAPL")
                .side(OrderSide.SELL)
                .type(OrderType.MARKET)
                .quantity(new BigDecimal("20.000000"))
                .build();

        when(userService.getUserById(1L)).thenReturn(sampleUser);
        when(assetService.getAssetEntityBySymbol("AAPL")).thenReturn(sampleAsset);
        when(marketDataService.getQuote("AAPL")).thenReturn(sampleQuote);
        when(holdingRepository.findByUserIdAndAssetIdWithLock(1L, 10L)).thenReturn(Optional.empty());

        assertThrows(InsufficientHoldingsException.class, () -> orderService.submitOrder(1L, request));
    }
}
