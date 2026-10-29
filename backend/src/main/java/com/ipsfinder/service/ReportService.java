package com.ipsfinder.service;

import com.ipsfinder.dto.ReportRequest;
import com.ipsfinder.dto.ReportResponse;
import com.ipsfinder.dto.ReportStatusUpdateRequest;
import com.ipsfinder.entity.Report;
import com.ipsfinder.entity.User;
import com.ipsfinder.exception.ResourceNotFoundException;
import com.ipsfinder.repository.ReportRepository;
import com.ipsfinder.repository.UserRepository;
import com.ipsfinder.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReportResponse createReport(ReportRequest request, UserPrincipal principal) {
        User reporter = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Report report = Report.builder()
                .reporter(reporter)
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .reason(request.getReason().trim())
                .createdAt(LocalDateTime.now())
                .build();

        report = reportRepository.save(report);
        return ReportResponse.from(report);
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ReportResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReportResponse updateReportStatus(Long id, ReportStatusUpdateRequest request) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id " + id));

        report.setStatus(request.getStatus());
        report = reportRepository.save(report);
        return ReportResponse.from(report);
    }
}
