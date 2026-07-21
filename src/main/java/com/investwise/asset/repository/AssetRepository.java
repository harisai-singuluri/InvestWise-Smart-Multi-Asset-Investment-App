package com.investwise.asset.repository;

import com.investwise.asset.entity.Asset;
import com.investwise.asset.entity.AssetClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    Optional<Asset> findBySymbol(String symbol);

    List<Asset> findByActiveTrue();

    List<Asset> findByAssetClassAndActiveTrue(AssetClass assetClass);

    @Query("SELECT a FROM Asset a WHERE a.active = true AND " +
           "(LOWER(a.symbol) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Asset> searchAssets(@Param("query") String query);

    @Query("SELECT a FROM Asset a WHERE a.active = true AND a.assetClass = :assetClass AND " +
           "(LOWER(a.symbol) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Asset> searchAssetsByClass(@Param("assetClass") AssetClass assetClass, @Param("query") String query);
}
