package com.ipsfinder.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ipsfinder.entity.FoodType;
import com.ipsfinder.entity.ListingStatus;
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
public class MessProfileResponse {

    private Long id;
    private Long ownerId;
    private String ownerName;
    private String ownerPhone;
    private String ownerBusinessName;

    private String name;
    private String description;
    private FoodType foodType;
    private String openTime;
    private String closeTime;
    private Double pricePerMeal;
    private Double monthlyPrice;
    private Double deliveryCharge;
    private String deliveryArea;
    private String address;
    private Double lat;
    private Double lng;
    private List<String> images;

    @JsonProperty("isOpen")
    private boolean isOpen;

    @JsonProperty("isOpen")
    public boolean isOpen() {
        return isOpen;
    }

    @JsonProperty("isOpen")
    public boolean getIsOpen() {
        return isOpen;
    }

    @JsonProperty("isOpen")
    public void setIsOpen(boolean open) {
        this.isOpen = open;
    }

    private ListingStatus status;
    private boolean verified;
    private String rejectionReason;
    private LocalDateTime lastUpdated;
    private LocalDateTime createdAt;

    // Computed fields
    private Double distanceKm;
    private Long lastUpdatedDaysAgo;
    private boolean stale;
    private Double averageRating;
    private Long reviewCount;

    private List<MenuItemResponse> menuItems;
}
