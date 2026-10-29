package com.ipsfinder.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBedsRequest {

    @NotNull(message = "Available beds count is required")
    @Min(value = 0, message = "Available beds cannot be negative")
    private Integer availableBeds;
}
