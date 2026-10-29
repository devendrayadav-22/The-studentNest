package com.ipsfinder.dto;

import com.ipsfinder.entity.TargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryRequest {

    @NotNull(message = "Target type is required (PG, MESS)")
    private TargetType targetType;

    @NotNull(message = "Target ID is required")
    private Long targetId;

    @NotBlank(message = "Message cannot be empty")
    private String message;
}
