package com.ipsfinder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerStatsResponse {
    private long totalListings;
    private long approvedListings;
    private long pendingListings;
    private long totalViews;
    private long totalInquiries;
    private int totalBeds;
}
