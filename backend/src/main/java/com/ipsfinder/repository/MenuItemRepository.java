package com.ipsfinder.repository;

import com.ipsfinder.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByMessId(Long messId);
    Optional<MenuItem> findByIdAndMessId(Long id, Long messId);
    void deleteByMessId(Long messId);
}
