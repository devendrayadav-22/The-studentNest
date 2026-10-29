package com.ipsfinder.repository;

import com.ipsfinder.entity.ListingStatus;
import com.ipsfinder.entity.MessProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessProfileRepository extends JpaRepository<MessProfile, Long>, JpaSpecificationExecutor<MessProfile> {

    Optional<MessProfile> findByOwnerId(Long ownerId);

    List<MessProfile> findByStatus(ListingStatus status);

    long countByStatus(ListingStatus status);
}
