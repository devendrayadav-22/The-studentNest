package com.ipsfinder.scheduler;

import com.ipsfinder.entity.ListingStatus;
import com.ipsfinder.entity.MessProfile;
import com.ipsfinder.entity.PgListing;
import com.ipsfinder.repository.MessProfileRepository;
import com.ipsfinder.repository.PgListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class StaleListingScheduler {

    private final PgListingRepository pgListingRepository;
    private final MessProfileRepository messProfileRepository;

    /**
     * Daily job that checks and logs listings not updated for 30 days.
     * Flags only; does not hide approved listings.
     */
    @Scheduled(cron = "0 0 4 * * ?") // Runs daily at 04:00 AM
    @Transactional(readOnly = true)
    public void checkStaleListings() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);

        List<PgListing> stalePgs = pgListingRepository.findByLastUpdatedBeforeAndStatus(cutoff, ListingStatus.APPROVED);
        log.info("Running StaleListingScheduler check: found {} stale approved PG listings (not updated in > 30 days)", stalePgs.size());
        for (PgListing pg : stalePgs) {
            log.warn("FLAGGED STALE PG: ID={}, Title='{}', OwnerID={}, LastUpdated={}",
                    pg.getId(), pg.getTitle(), pg.getOwner().getId(), pg.getLastUpdated());
        }

        List<MessProfile> allApprovedMesses = messProfileRepository.findByStatus(ListingStatus.APPROVED);
        long staleMessCount = 0;
        for (MessProfile mess : allApprovedMesses) {
            if (mess.getLastUpdated() != null && mess.getLastUpdated().isBefore(cutoff)) {
                staleMessCount++;
                log.warn("FLAGGED STALE MESS: ID={}, Name='{}', OwnerID={}, LastUpdated={}",
                        mess.getId(), mess.getName(), mess.getOwner().getId(), mess.getLastUpdated());
            }
        }
        log.info("StaleListingScheduler check completed. Stale PGs: {}, Stale Messes: {}", stalePgs.size(), staleMessCount);
    }
}
