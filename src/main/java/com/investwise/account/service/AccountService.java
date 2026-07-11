package com.investwise.account.service;

import com.investwise.account.dto.AccountResponse;
import com.investwise.account.entity.Account;
import com.investwise.account.repository.AccountRepository;
import com.investwise.common.exception.InsufficientFundsException;
import com.investwise.common.exception.ResourceNotFoundException;
import com.investwise.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    @Value("${investwise.demo.initial-balance:100000.00}")
    private BigDecimal initialBalance;

    @Value("${investwise.demo.currency:USD}")
    private String defaultCurrency;

    @Transactional
    public Account createDemoAccount(User user) {
        Account account = Account.builder()
                .user(user)
                .currency(defaultCurrency)
                .totalBalance(initialBalance)
                .availableCash(initialBalance)
                .reservedCash(BigDecimal.ZERO)
                .build();
        return accountRepository.save(account);
    }

    @Transactional(readOnly = true)
    public Account getAccountByUserId(Long userId) {
        return accountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for user id: " + userId));
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccountResponseByUserId(Long userId) {
        Account account = getAccountByUserId(userId);
        return mapToResponse(account);
    }

    @Transactional
    public Account reserveCash(Long userId, BigDecimal amount) {
        Account account = accountRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for user id: " + userId));

        if (account.getAvailableCash().compareTo(amount) < 0) {
            throw new InsufficientFundsException(
                    "Insufficient available cash. Required: " + amount + ", Available: " + account.getAvailableCash());
        }

        account.setAvailableCash(account.getAvailableCash().subtract(amount));
        account.setReservedCash(account.getReservedCash().add(amount));
        return accountRepository.save(account);
    }

    @Transactional
    public Account releaseReservedCash(Long userId, BigDecimal amount) {
        Account account = accountRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for user id: " + userId));

        BigDecimal cashToRelease = amount.min(account.getReservedCash());
        account.setReservedCash(account.getReservedCash().subtract(cashToRelease));
        account.setAvailableCash(account.getAvailableCash().add(cashToRelease));
        return accountRepository.save(account);
    }

    @Transactional
    public Account debitReservedCash(Long userId, BigDecimal amount) {
        Account account = accountRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for user id: " + userId));

        BigDecimal deduction = amount.min(account.getReservedCash());
        account.setReservedCash(account.getReservedCash().subtract(deduction));
        account.setTotalBalance(account.getTotalBalance().subtract(amount));

        if (amount.compareTo(deduction) > 0) {
            BigDecimal remainder = amount.subtract(deduction);
            if (account.getAvailableCash().compareTo(remainder) < 0) {
                throw new InsufficientFundsException("Insufficient funds to settle remaining amount");
            }
            account.setAvailableCash(account.getAvailableCash().subtract(remainder));
        }

        return accountRepository.save(account);
    }

    @Transactional
    public Account debitAvailableCash(Long userId, BigDecimal amount) {
        Account account = accountRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for user id: " + userId));

        if (account.getAvailableCash().compareTo(amount) < 0) {
            throw new InsufficientFundsException(
                    "Insufficient available cash. Required: " + amount + ", Available: " + account.getAvailableCash());
        }

        account.setAvailableCash(account.getAvailableCash().subtract(amount));
        account.setTotalBalance(account.getTotalBalance().subtract(amount));
        return accountRepository.save(account);
    }

    @Transactional
    public Account creditCash(Long userId, BigDecimal amount) {
        Account account = accountRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for user id: " + userId));

        account.setAvailableCash(account.getAvailableCash().add(amount));
        account.setTotalBalance(account.getTotalBalance().add(amount));
        return accountRepository.save(account);
    }

    @Transactional
    public AccountResponse resetDemoAccount(Long userId) {
        Account account = accountRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found for user id: " + userId));

        account.setTotalBalance(initialBalance);
        account.setAvailableCash(initialBalance);
        account.setReservedCash(BigDecimal.ZERO);
        Account saved = accountRepository.save(account);
        return mapToResponse(saved);
    }

    private AccountResponse mapToResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .userId(account.getUser().getId())
                .currency(account.getCurrency())
                .totalBalance(account.getTotalBalance())
                .availableCash(account.getAvailableCash())
                .reservedCash(account.getReservedCash())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}
