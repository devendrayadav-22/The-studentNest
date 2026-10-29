package com.ipsfinder.repository;

import com.ipsfinder.entity.TargetType;
import com.ipsfinder.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    boolean existsByStudentIdAndTargetTypeAndTargetId(Long studentId, TargetType targetType, Long targetId);
    Optional<Wishlist> findByStudentIdAndTargetTypeAndTargetId(Long studentId, TargetType targetType, Long targetId);
    void deleteByStudentIdAndId(Long studentId, Long id);
}
