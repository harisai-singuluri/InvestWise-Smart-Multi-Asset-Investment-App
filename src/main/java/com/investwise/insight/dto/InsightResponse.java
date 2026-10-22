package com.investwise.insight.dto;

import com.investwise.insight.entity.InsightType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsightResponse {
    private Long id;
    private String title;
    private String summary;
    private InsightType insightType;
    private BigDecimal confidenceScore;
    private String provider;
    private Instant createdAt;
}
