package com.investwise.account.service;

import com.investwise.account.entity.Account;
import com.investwise.account.repository.AccountRepository;
import com.investwise.common.exception.InsufficientFundsException;
import com.investwise.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private AccountService accountService;

    private Account sampleAccount;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(accountService, "initialBalance", new BigDecimal("100000.00"));
        ReflectionTestUtils.setField(accountService, "defaultCurrency", "USD");

        sampleAccount = Account.builder()
                .id(1L)
                .currency("USD")
                .totalBalance(new BigDecimal("10000.0000"))
                .availableCash(new BigDecimal("8000.0000"))
                .reservedCash(new BigDecimal("2000.0000"))
                .build();
    }

    @Test
    void reserveCash_Success() {
        when(accountRepository.findByUserIdWithLock(1L)).thenReturn(Optional.of(sampleAccount));
        when(accountRepository.save(any(Account.class))).thenAnswer(i -> i.getArgument(0));

        Account result = accountService.reserveCash(1L, new BigDecimal("3000.0000"));

        assertEquals(new BigDecimal("5000.0000"), result.getAvailableCash());
        assertEquals(new BigDecimal("5000.0000"), result.getReservedCash());
    }

    @Test
    void reserveCash_InsufficientFunds_ThrowsException() {
        when(accountRepository.findByUserIdWithLock(1L)).thenReturn(Optional.of(sampleAccount));

        assertThrows(InsufficientFundsException.class, () ->
                accountService.reserveCash(1L, new BigDecimal("12000.0000")));
    }

    @Test
    void releaseReservedCash_Success() {
        when(accountRepository.findByUserIdWithLock(1L)).thenReturn(Optional.of(sampleAccount));
        when(accountRepository.save(any(Account.class))).thenAnswer(i -> i.getArgument(0));

        Account result = accountService.releaseReservedCash(1L, new BigDecimal("1000.0000"));

        assertEquals(new BigDecimal("9000.0000"), result.getAvailableCash());
        assertEquals(new BigDecimal("1000.0000"), result.getReservedCash());
    }
}
