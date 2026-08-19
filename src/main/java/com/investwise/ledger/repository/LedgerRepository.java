package com.investwise.ledger.repository;

import com.investwise.ledger.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LedgerRepository extends JpaRepository<LedgerEntry, Long> {

    List<LedgerEntry> findByUserIdOrderByTimestampDesc(Long userId);

    List<LedgerEntry> findByTransactionId(Long transactionId);

    void deleteByUserId(Long userId);
}
