package com.ipsfinder.controller;

import com.ipsfinder.dto.ApiResponse;
import com.ipsfinder.dto.WishlistRequest;
import com.ipsfinder.dto.WishlistResponse;
import com.ipsfinder.security.UserPrincipal;
import com.ipsfinder.service.WishlistService;
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
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Wishlist", description = "Endpoints for students to bookmark PGs and Messes")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Get current student's wishlist")
    public ResponseEntity<List<WishlistResponse>> getWishlist(@AuthenticationPrincipal UserPrincipal principal) {
        List<WishlistResponse> list = wishlistService.getMyWishlist(principal);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @Operation(summary = "Add PG or Mess to wishlist")
    public ResponseEntity<WishlistResponse> addToWishlist(
            @Valid @RequestBody WishlistRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        WishlistResponse response = wishlistService.addToWishlist(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove item from wishlist")
    public ResponseEntity<ApiResponse> removeFromWishlist(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        wishlistService.removeFromWishlist(id, principal);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Removed from wishlist").build());
    }
}
