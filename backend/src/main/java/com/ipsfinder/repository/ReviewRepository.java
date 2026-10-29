package com.ipsfinder.repository;

import com.ipsfinder.entity.Review;
import com.ipsfinder.entity.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(TargetType targetType, Long targetId);

    List<Review> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    boolean existsByStudentIdAndTargetTypeAndTargetId(Long studentId, TargetType targetType, Long targetId);

    Optional<Review> findByStudentIdAndTargetTypeAndTargetId(Long studentId, TargetType targetType, Long targetId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.targetType = :targetType AND r.targetId = :targetId")
    Double findAverageRatingByTarget(@Param("targetType") TargetType targetType, @Param("targetId") Long targetId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.targetType = :targetType AND r.targetId = :targetId")
    Long countByTarget(@Param("targetType") TargetType targetType, @Param("targetId") Long targetId);

    List<Review> findAllByOrderByCreatedAtDesc();
}
