package com.ipsfinder.controller;

import com.ipsfinder.dto.*;
import com.ipsfinder.security.UserPrincipal;
import com.ipsfinder.service.MessProfileService;
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
@RequestMapping("/api/mess-owner")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MESS_OWNER', 'ADMIN')")
@Tag(name = "Mess Owner Operations", description = "Endpoints for Mess owners to manage their profile, menu, and status")
public class MessOwnerController {

    private final MessProfileService messProfileService;

    @PostMapping("/profile")
    @Operation(summary = "Create Mess profile")
    public ResponseEntity<MessProfileResponse> createProfile(
            @Valid @RequestBody MessProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        MessProfileResponse response = messProfileService.createOrUpdateProfile(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current owner's mess profile")
    public ResponseEntity<MessProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        MessProfileResponse response = messProfileService.getOwnerProfile(principal);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    @Operation(summary = "Update Mess profile")
    public ResponseEntity<MessProfileResponse> updateProfile(
            @Valid @RequestBody MessProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        MessProfileResponse response = messProfileService.createOrUpdateProfile(request, principal);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/profile/open")
    @Operation(summary = "Toggle Open/Closed status")
    public ResponseEntity<MessProfileResponse> toggleOpen(@AuthenticationPrincipal UserPrincipal principal) {
        MessProfileResponse response = messProfileService.toggleOpen(principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirm-availability")
    @Operation(summary = "Confirm availability timestamp")
    public ResponseEntity<MessProfileResponse> confirmAvailability(@AuthenticationPrincipal UserPrincipal principal) {
        MessProfileResponse response = messProfileService.confirmAvailability(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get mess dashboard statistics")
    public ResponseEntity<MessStatsResponse> getStats(@AuthenticationPrincipal UserPrincipal principal) {
        MessStatsResponse stats = messProfileService.getOwnerStats(principal);
        return ResponseEntity.ok(stats);
    }

    // Menu Item CRUD
    @GetMapping("/menu")
    @Operation(summary = "Get menu items")
    public ResponseEntity<List<MenuItemResponse>> getMenuItems(@AuthenticationPrincipal UserPrincipal principal) {
        List<MenuItemResponse> items = messProfileService.getMenuItems(principal);
        return ResponseEntity.ok(items);
    }

    @PostMapping("/menu")
    @Operation(summary = "Add menu item")
    public ResponseEntity<MenuItemResponse> addMenuItem(
            @Valid @RequestBody MenuItemRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        MenuItemResponse item = messProfileService.addMenuItem(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @PutMapping("/menu/{id}")
    @Operation(summary = "Update menu item")
    public ResponseEntity<MenuItemResponse> updateMenuItem(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        MenuItemResponse item = messProfileService.updateMenuItem(id, request, principal);
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/menu/{id}")
    @Operation(summary = "Delete menu item")
    public ResponseEntity<ApiResponse> deleteMenuItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        messProfileService.deleteMenuItem(id, principal);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Menu item deleted successfully").build());
    }
}
