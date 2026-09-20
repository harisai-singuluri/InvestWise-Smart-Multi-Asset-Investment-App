package com.investwise.portfolio.repository;

import com.investwise.asset.entity.Asset;
import com.investwise.portfolio.entity.Holding;
import com.investwise.user.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoldingRepository extends JpaRepository<Holding, Long> {

    List<Holding> findByUserId(Long userId);

    Optional<Holding> findByUserIdAndAssetId(Long userId, Long assetId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT h FROM Holding h WHERE h.user.id = :userId AND h.asset.id = :assetId")
    Optional<Holding> findByUserIdAndAssetIdWithLock(@Param("userId") Long userId, @Param("assetId") Long assetId);

    void deleteByUserId(Long userId);
}
