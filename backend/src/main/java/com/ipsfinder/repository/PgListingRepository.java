package com.ipsfinder.repository;

import com.ipsfinder.entity.ListingStatus;
import com.ipsfinder.entity.PgListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PgListingRepository extends JpaRepository<PgListing, Long>, JpaSpecificationExecutor<PgListing> {

    List<PgListing> findByOwnerId(Long ownerId);

    List<PgListing> findByStatus(ListingStatus status);

    long countByOwnerId(Long ownerId);

    long countByOwnerIdAndStatus(Long ownerId, ListingStatus status);

    long countByStatus(ListingStatus status);

    @Query("SELECT COALESCE(SUM(p.viewCount), 0) FROM PgListing p WHERE p.owner.id = :ownerId")
    Long sumViewCountByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT COALESCE(SUM(p.availableBeds), 0) FROM PgListing p WHERE p.owner.id = :ownerId")
    Integer sumAvailableBedsByOwnerId(@Param("ownerId") Long ownerId);

    List<PgListing> findByLastUpdatedBeforeAndStatus(LocalDateTime cutoff, ListingStatus status);
}
