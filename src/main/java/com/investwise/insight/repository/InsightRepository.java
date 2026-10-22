package com.investwise.insight.repository;

import com.investwise.insight.entity.Insight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsightRepository extends JpaRepository<Insight, Long> {

    List<Insight> findByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteByUserId(Long userId);
}
