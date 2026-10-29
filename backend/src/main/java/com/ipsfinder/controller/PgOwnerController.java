package com.ipsfinder.controller;

import com.ipsfinder.dto.ApiResponse;
import com.ipsfinder.dto.OwnerStatsResponse;
import com.ipsfinder.dto.PgListingRequest;
import com.ipsfinder.dto.PgListingResponse;
import com.ipsfinder.dto.UpdateBedsRequest;
import com.ipsfinder.security.UserPrincipal;
import com.ipsfinder.service.PgListingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('PG_OWNER', 'ADMIN')")
@Tag(name = "PG Owner Operations", description = "Endpoints for PG owners to manage their listings and track stats")
public class PgOwnerController {

    private final PgListingService pgListingService;

    @PostMapping("/pgs")
    @Operation(summary = "Create PG listing", description = "Creates a new listing in PENDING status pending admin approval")
    public ResponseEntity<PgListingResponse> createListing(
            @Valid @RequestBody PgListingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        PgListingResponse response = pgListingService.createListing(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/pgs")
    @Operation(summary = "Get owner's PG listings")
    public ResponseEntity<List<PgListingResponse>> getMyListings(@AuthenticationPrincipal UserPrincipal principal) {
        List<PgListingResponse> listings = pgListingService.getOwnerListings(principal);
        return ResponseEntity.ok(listings);
    }

    @PutMapping("/pgs/{id}")
    @Operation(summary = "Update PG listing", description = "Updates PG listing; approved listings remain approved")
    public ResponseEntity<PgListingResponse> updateListing(
            @PathVariable Long id,
            @Valid @RequestBody PgListingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        PgListingResponse response = pgListingService.updateListing(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/pgs/{id}")
    @Operation(summary = "Delete PG listing")
    public ResponseEntity<ApiResponse> deleteListing(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        pgListingService.deleteListing(id, principal);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Listing deleted successfully").build());
    }

    @PostMapping("/pgs/{id}/confirm-availability")
    @Operation(summary = "Confirm availability", description = "Refreshes lastUpdated timestamp to prevent listing from becoming stale")
    public ResponseEntity<PgListingResponse> confirmAvailability(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        PgListingResponse response = pgListingService.confirmAvailability(id, principal);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/pgs/{id}/beds")
    @Operation(summary = "Update available bed count")
    public ResponseEntity<PgListingResponse> updateBeds(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBedsRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        PgListingResponse response = pgListingService.updateBeds(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get owner dashboard stats", description = "Returns total listings, approved, pending, views, inquiries, beds")
    public ResponseEntity<OwnerStatsResponse> getStats(@AuthenticationPrincipal UserPrincipal principal) {
        OwnerStatsResponse stats = pgListingService.getOwnerStats(principal);
        return ResponseEntity.ok(stats);
    }
}
