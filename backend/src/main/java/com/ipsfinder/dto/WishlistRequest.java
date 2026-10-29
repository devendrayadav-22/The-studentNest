package com.ipsfinder.dto;

import com.ipsfinder.entity.TargetType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistRequest {

    @NotNull(message = "Target type is required (PG, MESS)")
    private TargetType targetType;

    @NotNull(message = "Target ID is required")
    private Long targetId;
}
