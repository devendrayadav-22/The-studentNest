package com.ipsfinder.controller;

import com.ipsfinder.dto.ApiResponse;
import com.ipsfinder.service.DevService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dev")
@RequiredArgsConstructor
@Tag(name = "Development Tools", description = "Endpoints active only in demo mode")
public class DevController {

    private final DevService devService;

    @PostMapping("/reset-demo")
    @Operation(summary = "Reset demo data", description = "Wipes database and re-runs seeder (only when demo.mode=true)")
    public ResponseEntity<ApiResponse> resetDemo() {
        ApiResponse response = devService.resetDemo();
        return ResponseEntity.ok(response);
    }
}
