package com.ipsfinder.controller;

import com.ipsfinder.dto.ApiResponse;
import com.ipsfinder.dto.ReviewReplyRequest;
import com.ipsfinder.dto.ReviewRequest;
import com.ipsfinder.dto.ReviewResponse;
import com.ipsfinder.entity.TargetType;
import com.ipsfinder.security.UserPrincipal;
import com.ipsfinder.service.ReviewService;
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
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews & Ratings", description = "Endpoints for students to review listings and owners to reply")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Get reviews for a target PG or Mess (Public)")
    public ResponseEntity<List<ReviewResponse>> getReviews(
            @RequestParam TargetType targetType,
            @RequestParam Long targetId) {
        List<ReviewResponse> list = reviewService.getReviewsForTarget(targetType, targetId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Post review", description = "Students can post one review per target")
    public ResponseEntity<ReviewResponse> postReview(
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ReviewResponse response = reviewService.postReview(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Update my review")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ReviewResponse response = reviewService.updateReview(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @Operation(summary = "Delete review")
    public ResponseEntity<ApiResponse> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        reviewService.deleteReview(id, principal);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Review deleted successfully").build());
    }

    @PostMapping("/{id}/reply")
    @PreAuthorize("hasAnyRole('PG_OWNER', 'MESS_OWNER', 'ADMIN')")
    @Operation(summary = "Owner reply to review", description = "Target owners can post a reply to reviews on their listing")
    public ResponseEntity<ReviewResponse> replyToReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewReplyRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ReviewResponse response = reviewService.replyToReview(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my submitted reviews")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(@AuthenticationPrincipal UserPrincipal principal) {
        List<ReviewResponse> list = reviewService.getMyReviews(principal);
        return ResponseEntity.ok(list);
    }
}
