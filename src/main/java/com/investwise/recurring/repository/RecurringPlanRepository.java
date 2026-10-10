package com.investwise.recurring.repository;

import com.investwise.recurring.entity.RecurringPlan;
import com.investwise.recurring.entity.RecurringStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringPlanRepository extends JpaRepository<RecurringPlan, Long> {

    List<RecurringPlan> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<RecurringPlan> findByStatusAndNextExecutionDateLessThanEqual(RecurringStatus status, LocalDate date);

    void deleteByUserId(Long userId);
}
