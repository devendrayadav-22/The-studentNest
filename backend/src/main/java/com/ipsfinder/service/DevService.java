package com.ipsfinder.service;

import com.ipsfinder.config.DataSeeder;
import com.ipsfinder.dto.ApiResponse;
import com.ipsfinder.exception.ResourceNotFoundException;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DevService {

    private final EntityManager entityManager;
    private final DataSeeder dataSeeder;

    @Value("${demo.mode:false}")
    private boolean demoMode;

    @Transactional
    public ApiResponse resetDemo() {
        if (!demoMode) {
            throw new ResourceNotFoundException("Demo mode is disabled");
        }

        log.info("Resetting demo database: wiping all tables and reseeding...");

        try {
            // PostgreSQL native cascade truncate
            entityManager.createNativeQuery(
                    "TRUNCATE TABLE announcements, reports, inquiries, wishlists, reviews, " +
                    "menu_items, mess_images, mess_profiles, pg_images, pg_facilities, pg_listings, users " +
                    "RESTART IDENTITY CASCADE"
            ).executeUpdate();
        } catch (Exception ex) {
            log.warn("PostgreSQL multi-table truncate failed ({}), falling back to H2 / single table cleanup...", ex.getMessage());
            try {
                // H2 cleanup
                entityManager.createNativeQuery("SET REFERENTIAL_INTEGRITY FALSE").executeUpdate();
                String[] tables = {
                        "announcements", "reports", "inquiries", "wishlists", "reviews",
                        "menu_items", "mess_images", "mess_profiles", "pg_images", "pg_facilities", "pg_listings", "users"
                };
                for (String t : tables) {
                    try {
                        entityManager.createNativeQuery("TRUNCATE TABLE " + t).executeUpdate();
                    } catch (Exception ignored) {
                        entityManager.createNativeQuery("DELETE FROM " + t).executeUpdate();
                    }
                }
                entityManager.createNativeQuery("SET REFERENTIAL_INTEGRITY TRUE").executeUpdate();
            } catch (Exception h2Ex) {
                log.error("Failed table cleanup: {}", h2Ex.getMessage());
            }
        }

        entityManager.flush();
        entityManager.clear();

        // Re-run the seeder
        dataSeeder.seedAll();

        return ApiResponse.builder()
                .success(true)
                .message("Demo database wiped and re-seeded successfully")
                .build();
    }
}
