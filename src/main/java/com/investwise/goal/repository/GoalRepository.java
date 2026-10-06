package com.investwise.goal.repository;

import com.investwise.goal.entity.InvestmentGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<InvestmentGoal, Long> {
    List<InvestmentGoal> findByUserIdOrderByCreatedAtDesc(Long userId);
    void deleteByUserId(Long userId);
}
