package com.investwise.alert.repository;

import com.investwise.alert.entity.AlertCondition;
import com.investwise.alert.entity.AlertStatus;
import com.investwise.alert.entity.PriceAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PriceAlertRepository extends JpaRepository<PriceAlert, Long> {

    List<PriceAlert> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<PriceAlert> findByStatus(AlertStatus status);

    boolean existsByUserIdAndAssetSymbolAndAlertConditionAndThresholdPriceAndStatus(
            Long userId, String symbol, AlertCondition condition, BigDecimal thresholdPrice, AlertStatus status);

    void deleteByUserId(Long userId);
}
