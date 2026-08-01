package com.investwise.marketdata.entity;

import com.investwise.asset.entity.Asset;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "market_quotes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketQuote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false, unique = true)
    private Asset asset;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal change24h;

    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal changePercent24h;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal high24h;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal low24h;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal volume24h;

    @Column(nullable = false)
    private Instant observedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.observedAt = Instant.now();
    }
}
