package com.ipsfinder.dto;

import com.ipsfinder.entity.Report;
import com.ipsfinder.entity.ReportStatus;
import com.ipsfinder.entity.TargetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {

    private Long id;
    private Long reporterId;
    private String reporterName;
    private TargetType targetType;
    private Long targetId;
    private String reason;
    private ReportStatus status;
    private LocalDateTime createdAt;

    public static ReportResponse from(Report report) {
        if (report == null) return null;
        return ReportResponse.builder()
                .id(report.getId())
                .reporterId(report.getReporter() != null ? report.getReporter().getId() : null)
                .reporterName(report.getReporter() != null ? report.getReporter().getName() : null)
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .reason(report.getReason())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
