package com.ipsfinder.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ipsfinder.entity.ListingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessStatsResponse {
    private long totalMenuItems;

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

    private boolean verified;
    private ListingStatus status;
    private long totalInquiries;
}
