package com.ipsfinder.controller;

import com.ipsfinder.dto.InquiryRequest;
import com.ipsfinder.dto.InquiryResponse;
import com.ipsfinder.dto.InquiryStatusUpdateRequest;
import com.ipsfinder.security.UserPrincipal;
import com.ipsfinder.service.InquiryService;
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
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
@Tag(name = "Inquiries", description = "Endpoints for students to inquire and owners to track inquiries")
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Send an inquiry to PG or Mess owner")
    public ResponseEntity<InquiryResponse> sendInquiry(
            @Valid @RequestBody InquiryRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        InquiryResponse response = inquiryService.createInquiry(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get inquiries sent by current student")
    public ResponseEntity<List<InquiryResponse>> getMyInquiries(@AuthenticationPrincipal UserPrincipal principal) {
        List<InquiryResponse> list = inquiryService.getMyInquiries(principal);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/received")
    @PreAuthorize("hasAnyRole('PG_OWNER', 'MESS_OWNER', 'ADMIN')")
    @Operation(summary = "Get inquiries received by owner")
    public ResponseEntity<List<InquiryResponse>> getReceivedInquiries(@AuthenticationPrincipal UserPrincipal principal) {
        List<InquiryResponse> list = inquiryService.getReceivedInquiries(principal);
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('PG_OWNER', 'MESS_OWNER', 'ADMIN')")
    @Operation(summary = "Update inquiry status (NEW, CONTACTED)")
    public ResponseEntity<InquiryResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody InquiryStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        InquiryResponse response = inquiryService.updateStatus(id, request, principal);
        return ResponseEntity.ok(response);
    }
}
