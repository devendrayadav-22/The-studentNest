package com.ipsfinder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long totalStudents;
    private long totalPgOwners;
    private long totalMessOwners;

    private long totalPgs;
    private long pendingPgs;
    private long approvedPgs;

    private long totalMesses;
    private long pendingMesses;
    private long approvedMesses;

    private long totalReviews;
    private long totalReports;
    private long openReports;
}
