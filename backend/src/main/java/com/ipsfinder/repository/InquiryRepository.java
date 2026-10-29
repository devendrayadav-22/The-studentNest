package com.ipsfinder.repository;

import com.ipsfinder.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<Inquiry> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    long countByOwnerId(Long ownerId);
}
