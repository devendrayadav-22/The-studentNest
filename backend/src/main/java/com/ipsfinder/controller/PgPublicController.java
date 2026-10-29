package com.ipsfinder.controller;

import com.ipsfinder.dto.PagedResponse;
import com.ipsfinder.dto.PgListingResponse;
import com.ipsfinder.entity.Gender;
import com.ipsfinder.entity.PgType;
import com.ipsfinder.entity.SharingType;
import com.ipsfinder.security.UserPrincipal;
import com.ipsfinder.service.PgListingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pgs")
@RequiredArgsConstructor
@Tag(name = "PG Listings (Public)", description = "Public endpoints for searching and viewing approved PG listings")
public class PgPublicController {

    private final PgListingService pgListingService;

    @GetMapping
    @Operation(summary = "Search PG listings", description = "Filters approved PG listings by location, rent, facilities, distance, etc.")
    public ResponseEntity<PagedResponse<PgListingResponse>> searchPgs(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) PgType type,
            @RequestParam(required = false) Double minRent,
            @RequestParam(required = false) Double maxRent,
            @RequestParam(required = false) Gender gender,
            @RequestParam(required = false) SharingType sharing,
            @RequestParam(required = false) String facilities,
            @RequestParam(required = false) Boolean verifiedOnly,
            @RequestParam(required = false) Double maxDistanceKm,
            @RequestParam(required = false, defaultValue = "latest") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String order,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        PagedResponse<PgListingResponse> results = pgListingService.searchPublic(
                q, type, minRent, maxRent, gender, sharing, facilities,
                verifiedOnly, maxDistanceKm, sortBy, order, page, size, currentUser
        );
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get PG listing details", description = "Fetches approved listing details and increments viewCount")
    public ResponseEntity<PgListingResponse> getPgDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        PgListingResponse pg = pgListingService.getPublicById(id, currentUser);
        return ResponseEntity.ok(pg);
    }
}
