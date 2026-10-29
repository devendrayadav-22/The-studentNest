package com.ipsfinder.controller;

import com.ipsfinder.dto.*;
import com.ipsfinder.entity.Role;
import com.ipsfinder.service.AdminService;
import com.ipsfinder.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Operations", description = "Endpoints for platform administrators (approvals, users, reports, announcements)")
public class AdminController {

    private final AdminService adminService;
    private final ReportService reportService;

    @GetMapping("/stats")
    @Operation(summary = "Get overall platform statistics")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/pending")
    @Operation(summary = "Get all pending PG and Mess listings")
    public ResponseEntity<Map<String, Object>> getPending() {
        return ResponseEntity.ok(adminService.getPending());
    }

    @PostMapping("/pgs/{id}/approve")
    @Operation(summary = "Approve PG listing", description = "Sets status to APPROVED and verified to true")
    public ResponseEntity<PgListingResponse> approvePg(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approvePg(id));
    }

    @PostMapping("/pgs/{id}/reject")
    @Operation(summary = "Reject PG listing with reason")
    public ResponseEntity<PgListingResponse> rejectPg(
            @PathVariable Long id,
            @Valid @RequestBody RejectRequest request) {
        return ResponseEntity.ok(adminService.rejectPg(id, request));
    }

    @PostMapping("/messes/{id}/approve")
    @Operation(summary = "Approve Mess profile")
    public ResponseEntity<MessProfileResponse> approveMess(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approveMess(id));
    }

    @PostMapping("/messes/{id}/reject")
    @Operation(summary = "Reject Mess profile with reason")
    public ResponseEntity<MessProfileResponse> rejectMess(
            @PathVariable Long id,
            @Valid @RequestBody RejectRequest request) {
        return ResponseEntity.ok(adminService.rejectMess(id, request));
    }

    @GetMapping("/listings")
    @Operation(summary = "Get all listings regardless of approval status")
    public ResponseEntity<Map<String, Object>> getAllListings() {
        return ResponseEntity.ok(adminService.getAllListings());
    }

    @DeleteMapping("/pgs/{id}")
    @Operation(summary = "Admin delete PG listing")
    public ResponseEntity<ApiResponse> deletePg(@PathVariable Long id) {
        adminService.deletePg(id);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("PG deleted by admin").build());
    }

    @DeleteMapping("/messes/{id}")
    @Operation(summary = "Admin delete Mess profile")
    public ResponseEntity<ApiResponse> deleteMess(@PathVariable Long id) {
        adminService.deleteMess(id);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Mess deleted by admin").build());
    }

    @GetMapping("/users")
    @Operation(summary = "Get users filtered optionally by role")
    public ResponseEntity<List<UserSummaryDto>> getUsers(@RequestParam(required = false) Role role) {
        return ResponseEntity.ok(adminService.getUsers(role));
    }

    @PatchMapping("/users/{id}/block")
    @Operation(summary = "Block user from logging in")
    public ResponseEntity<UserSummaryDto> blockUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.blockUser(id));
    }

    @PatchMapping("/users/{id}/unblock")
    @Operation(summary = "Unblock user")
    public ResponseEntity<UserSummaryDto> unblockUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.unblockUser(id));
    }

    @GetMapping("/reviews")
    @Operation(summary = "Get all reviews for moderation")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(adminService.getAllReviews());
    }

    @DeleteMapping("/reviews/{id}")
    @Operation(summary = "Admin delete review")
    public ResponseEntity<ApiResponse> deleteReview(@PathVariable Long id) {
        adminService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Review removed by admin").build());
    }

    @GetMapping("/reports")
    @Operation(summary = "Get all submitted reports")
    public ResponseEntity<List<ReportResponse>> getReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @PatchMapping("/reports/{id}")
    @Operation(summary = "Update report status (OPEN, RESOLVED, DISMISSED)")
    public ResponseEntity<ReportResponse> updateReportStatus(
            @PathVariable Long id,
            @Valid @RequestBody ReportStatusUpdateRequest request) {
        return ResponseEntity.ok(reportService.updateReportStatus(id, request));
    }

    @PostMapping("/announcements")
    @Operation(summary = "Create an announcement")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(@Valid @RequestBody AnnouncementRequest request) {
        AnnouncementResponse response = adminService.createAnnouncement(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/announcements/{id}")
    @Operation(summary = "Update an announcement")
    public ResponseEntity<AnnouncementResponse> updateAnnouncement(
            @PathVariable Long id,
            @Valid @RequestBody AnnouncementRequest request) {
        AnnouncementResponse response = adminService.updateAnnouncement(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/announcements/{id}")
    @Operation(summary = "Delete an announcement")
    public ResponseEntity<ApiResponse> deleteAnnouncement(@PathVariable Long id) {
        adminService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Announcement deleted").build());
    }
}
