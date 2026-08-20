package com.investwise.ledger.service;

import com.investwise.asset.entity.Asset;
import com.investwise.ledger.dto.LedgerEntryResponse;
import com.investwise.ledger.dto.TransactionResponse;
import com.investwise.ledger.entity.LedgerEntry;
import com.investwise.ledger.entity.LedgerEntryType;
import com.investwise.ledger.entity.TransactionRecord;
import com.investwise.ledger.repository.LedgerRepository;
import com.investwise.ledger.repository.TransactionRepository;
import com.investwise.order.entity.Order;
import com.investwise.order.entity.OrderSide;
import com.investwise.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LedgerService {

    private final TransactionRepository transactionRepository;
    private final LedgerRepository ledgerRepository;

    @Transactional
    public TransactionRecord recordExecution(Order order,
                                            User user,
                                            Asset asset,
                                            OrderSide side,
                                            BigDecimal quantity,
                                            BigDecimal executionPrice,
                                            BigDecimal totalAmount,
                                            BigDecimal fee,
                                            BigDecimal cashBalanceAfter) {
        TransactionRecord record = TransactionRecord.builder()
                .order(order)
                .user(user)
                .asset(asset)
                .side(side)
                .quantity(quantity)
                .executionPrice(executionPrice)
                .totalAmount(totalAmount)
                .fee(fee)
                .build();

        TransactionRecord savedTransaction = transactionRepository.save(record);

        if (side == OrderSide.BUY) {
            LedgerEntry cashLeg = LedgerEntry.builder()
                    .transaction(savedTransaction)
                    .user(user)
                    .entryType(LedgerEntryType.CASH_DEBIT)
                    .debitAmount(totalAmount)
                    .creditAmount(BigDecimal.ZERO)
                    .currency("USD")
                    .balanceAfter(cashBalanceAfter)
                    .build();

            LedgerEntry assetLeg = LedgerEntry.builder()
                    .transaction(savedTransaction)
                    .user(user)
                    .entryType(LedgerEntryType.ASSET_ACQUISITION)
                    .debitAmount(BigDecimal.ZERO)
                    .creditAmount(totalAmount)
                    .currency("USD")
                    .assetSymbol(asset.getSymbol())
                    .assetQuantity(quantity)
                    .balanceAfter(cashBalanceAfter)
                    .build();

            ledgerRepository.save(cashLeg);
            ledgerRepository.save(assetLeg);
        } else {
            LedgerEntry assetLeg = LedgerEntry.builder()
                    .transaction(savedTransaction)
                    .user(user)
                    .entryType(LedgerEntryType.ASSET_DISPOSAL)
                    .debitAmount(totalAmount)
                    .creditAmount(BigDecimal.ZERO)
                    .currency("USD")
                    .assetSymbol(asset.getSymbol())
                    .assetQuantity(quantity)
                    .balanceAfter(cashBalanceAfter)
                    .build();

            LedgerEntry cashLeg = LedgerEntry.builder()
                    .transaction(savedTransaction)
                    .user(user)
                    .entryType(LedgerEntryType.CASH_CREDIT)
                    .debitAmount(BigDecimal.ZERO)
                    .creditAmount(totalAmount)
                    .currency("USD")
                    .balanceAfter(cashBalanceAfter)
                    .build();

            ledgerRepository.save(assetLeg);
            ledgerRepository.save(cashLeg);
        }

        return savedTransaction;
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getUserTransactions(Long userId) {
        return transactionRepository.findByUserIdOrderByTimestampDesc(userId).stream()
                .map(this::mapToTransactionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LedgerEntryResponse> getUserLedgerEntries(Long userId) {
        return ledgerRepository.findByUserIdOrderByTimestampDesc(userId).stream()
                .map(this::mapToLedgerResponse)
                .collect(Collectors.toList());
    }

    public TransactionResponse mapToTransactionResponse(TransactionRecord record) {
        return TransactionResponse.builder()
                .id(record.getId())
                .orderId(record.getOrder().getId())
                .userId(record.getUser().getId())
                .assetSymbol(record.getAsset().getSymbol())
                .assetName(record.getAsset().getName())
                .side(record.getSide())
                .quantity(record.getQuantity())
                .executionPrice(record.getExecutionPrice())
                .totalAmount(record.getTotalAmount())
                .fee(record.getFee())
                .timestamp(record.getTimestamp())
                .build();
    }

    public LedgerEntryResponse mapToLedgerResponse(LedgerEntry entry) {
        return LedgerEntryResponse.builder()
                .id(entry.getId())
                .transactionId(entry.getTransaction().getId())
                .userId(entry.getUser().getId())
                .entryType(entry.getEntryType())
                .debitAmount(entry.getDebitAmount())
                .creditAmount(entry.getCreditAmount())
                .currency(entry.getCurrency())
                .assetSymbol(entry.getAssetSymbol())
                .assetQuantity(entry.getAssetQuantity())
                .balanceAfter(entry.getBalanceAfter())
                .timestamp(entry.getTimestamp())
                .build();
    }
}
