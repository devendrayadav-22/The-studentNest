package com.ipsfinder.controller;

import com.ipsfinder.dto.MessProfileResponse;
import com.ipsfinder.dto.PagedResponse;
import com.ipsfinder.entity.FoodType;
import com.ipsfinder.security.UserPrincipal;
import com.ipsfinder.service.MessProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messes")
@RequiredArgsConstructor
@Tag(name = "Mess & Tiffins (Public)", description = "Public endpoints for exploring mess and tiffin services")
public class MessPublicController {

    private final MessProfileService messProfileService;

    @GetMapping
    @Operation(summary = "Search Mess listings", description = "Filters approved mess profiles by food type, price, distance, etc.")
    public ResponseEntity<PagedResponse<MessProfileResponse>> searchMesses(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) FoodType foodType,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean openNow,
            @RequestParam(required = false) Double maxDistanceKm,
            @RequestParam(required = false, defaultValue = "latest") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String order,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        PagedResponse<MessProfileResponse> results = messProfileService.searchPublic(
                q, foodType, maxPrice, status, openNow, maxDistanceKm, sortBy, order, page, size, currentUser
        );
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Mess details and weekly menu")
    public ResponseEntity<MessProfileResponse> getMessDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        MessProfileResponse mess = messProfileService.getPublicById(id, currentUser);
        return ResponseEntity.ok(mess);
    }
}
