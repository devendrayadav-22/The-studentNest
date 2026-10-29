package com.ipsfinder.dto;

import com.ipsfinder.entity.InquiryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryStatusUpdateRequest {

    @NotNull(message = "Status is required (NEW, CONTACTED)")
    private InquiryStatus status;
}
