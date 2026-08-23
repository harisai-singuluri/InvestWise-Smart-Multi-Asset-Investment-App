package com.investwise.ledger.service;

import com.investwise.asset.entity.Asset;
import com.investwise.asset.entity.AssetClass;
import com.investwise.ledger.entity.LedgerEntry;
import com.investwise.ledger.entity.TransactionRecord;
import com.investwise.ledger.repository.LedgerRepository;
import com.investwise.ledger.repository.TransactionRepository;
import com.investwise.order.entity.Order;
import com.investwise.order.entity.OrderSide;
import com.investwise.order.entity.OrderStatus;
import com.investwise.order.entity.OrderType;
import com.investwise.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LedgerServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private LedgerRepository ledgerRepository;

    @InjectMocks
    private LedgerService ledgerService;

    private User sampleUser;
    private Asset sampleAsset;
    private Order sampleOrder;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder().id(1L).email("alex@investwise.app").build();
        sampleAsset = Asset.builder().id(2L).symbol("BTC").name("Bitcoin").assetClass(AssetClass.CRYPTO).build();
        sampleOrder = Order.builder()
                .id(10L)
                .user(sampleUser)
                .asset(sampleAsset)
                .side(OrderSide.BUY)
                .type(OrderType.MARKET)
                .quantity(new BigDecimal("0.500000"))
                .status(OrderStatus.FILLED)
                .build();
    }

    @Test
    void recordExecution_Buy_CreatesBalancedDebitAndCreditLedgerEntries() {
        when(transactionRepository.save(any(TransactionRecord.class))).thenAnswer(i -> {
            TransactionRecord tr = i.getArgument(0);
            tr.setId(50L);
            return tr;
        });

        BigDecimal quantity = new BigDecimal("0.500000");
        BigDecimal executionPrice = new BigDecimal("60000.0000");
        BigDecimal totalAmount = new BigDecimal("30000.0000");
        BigDecimal balanceAfter = new BigDecimal("70000.0000");

        TransactionRecord result = ledgerService.recordExecution(
                sampleOrder, sampleUser, sampleAsset, OrderSide.BUY,
                quantity, executionPrice, totalAmount, BigDecimal.ZERO, balanceAfter);

        assertNotNull(result);
        assertEquals(50L, result.getId());

        ArgumentCaptor<LedgerEntry> captor = ArgumentCaptor.forClass(LedgerEntry.class);
        verify(ledgerRepository, times(2)).save(captor.capture());

        List<LedgerEntry> entries = captor.getAllValues();
        assertEquals(2, entries.size());

        BigDecimal totalDebits = entries.stream().map(LedgerEntry::getDebitAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredits = entries.stream().map(LedgerEntry::getCreditAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        assertEquals(totalDebits, totalCredits);
        assertEquals(totalAmount, totalDebits);
    }
}
