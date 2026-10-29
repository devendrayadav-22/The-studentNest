package com.ipsfinder.dto;

import com.ipsfinder.entity.ReportStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportStatusUpdateRequest {

    @NotNull(message = "Status is required (OPEN, RESOLVED, DISMISSED)")
    private ReportStatus status;
}
