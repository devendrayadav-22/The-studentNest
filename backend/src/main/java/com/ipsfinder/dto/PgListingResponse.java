package com.ipsfinder.dto;

import com.ipsfinder.entity.Gender;
import com.ipsfinder.entity.ListingStatus;
import com.ipsfinder.entity.PgType;
import com.ipsfinder.entity.SharingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PgListingResponse {

    private Long id;
    private Long ownerId;
    private String ownerName;
    private String ownerPhone;
    private String ownerBusinessName;

    private String title;
    private String description;
    private PgType type;
    private Double rent;
    private Double deposit;
    private Gender gender;
    private SharingType sharing;
    private List<String> facilities;
    private String rules;
    private List<String> images;
    private String address;
    private Double lat;
    private Double lng;
    private Integer availableBeds;

    private ListingStatus status;
    private boolean verified;
    private String rejectionReason;
    private LocalDateTime lastUpdated;
    private LocalDateTime createdAt;
    private Long viewCount;

    // Computed fields
    private Double distanceKm;
    private Long lastUpdatedDaysAgo;
    private boolean stale;
    private Double averageRating;
    private Long reviewCount;
}
