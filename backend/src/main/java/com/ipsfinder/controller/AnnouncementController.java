package com.ipsfinder.controller;

import com.ipsfinder.dto.AnnouncementResponse;
import com.ipsfinder.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
@Tag(name = "Announcements (Public)", description = "Public announcements for campus students and owners")
public class AnnouncementController {

    private final AdminService adminService;

    @GetMapping
    @Operation(summary = "Get all announcements (Public)")
    public ResponseEntity<List<AnnouncementResponse>> getAnnouncements() {
        return ResponseEntity.ok(adminService.getAllAnnouncements());
    }
}
