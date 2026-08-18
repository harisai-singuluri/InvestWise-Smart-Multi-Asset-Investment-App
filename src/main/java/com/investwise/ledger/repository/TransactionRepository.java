package com.investwise.ledger.repository;

import com.investwise.ledger.entity.TransactionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionRecord, Long> {

    List<TransactionRecord> findByUserIdOrderByTimestampDesc(Long userId);

    void deleteByUserId(Long userId);
}
