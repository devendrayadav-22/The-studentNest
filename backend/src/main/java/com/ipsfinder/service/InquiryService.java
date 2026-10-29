package com.ipsfinder.service;

import com.ipsfinder.dto.InquiryRequest;
import com.ipsfinder.dto.InquiryResponse;
import com.ipsfinder.dto.InquiryStatusUpdateRequest;
import com.ipsfinder.entity.*;
import com.ipsfinder.exception.ForbiddenException;
import com.ipsfinder.exception.ResourceNotFoundException;
import com.ipsfinder.repository.InquiryRepository;
import com.ipsfinder.repository.MessProfileRepository;
import com.ipsfinder.repository.PgListingRepository;
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
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final PgListingRepository pgListingRepository;
    private final MessProfileRepository messProfileRepository;
    private final UserRepository userRepository;

    @Transactional
    public InquiryResponse createInquiry(InquiryRequest request, UserPrincipal principal) {
        if (principal.getRole() != Role.STUDENT) {
            throw new ForbiddenException("Only students can send inquiries");
        }

        User student = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student user not found"));

        User owner;
        String targetTitle;

        if (request.getTargetType() == TargetType.PG) {
            PgListing pg = pgListingRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new ResourceNotFoundException("PG listing not found with id " + request.getTargetId()));
            owner = pg.getOwner();
            targetTitle = pg.getTitle();
        } else {
            MessProfile mess = messProfileRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id " + request.getTargetId()));
            owner = mess.getOwner();
            targetTitle = mess.getName();
        }

        Inquiry inquiry = Inquiry.builder()
                .student(student)
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .owner(owner)
                .message(request.getMessage().trim())
                .status(InquiryStatus.NEW)
                .createdAt(LocalDateTime.now())
                .build();

        inquiry = inquiryRepository.save(inquiry);
        return InquiryResponse.from(inquiry, targetTitle);
    }

    @Transactional(readOnly = true)
    public List<InquiryResponse> getMyInquiries(UserPrincipal principal) {
        if (principal.getRole() != Role.STUDENT) {
            throw new ForbiddenException("Only students can access their sent inquiries");
        }

        return inquiryRepository.findByStudentIdOrderByCreatedAtDesc(principal.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InquiryResponse> getReceivedInquiries(UserPrincipal principal) {
        return inquiryRepository.findByOwnerIdOrderByCreatedAtDesc(principal.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InquiryResponse updateStatus(Long id, InquiryStatusUpdateRequest request, UserPrincipal principal) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found with id " + id));

        boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !inquiry.getOwner().getId().equals(principal.getId())) {
            throw new ForbiddenException("You can only update status for inquiries sent to your listings");
        }

        inquiry.setStatus(request.getStatus());
        inquiry = inquiryRepository.save(inquiry);
        return mapToResponse(inquiry);
    }

    private InquiryResponse mapToResponse(Inquiry inquiry) {
        String targetTitle = "Unknown";
        if (inquiry.getTargetType() == TargetType.PG) {
            targetTitle = pgListingRepository.findById(inquiry.getTargetId())
                    .map(PgListing::getTitle).orElse("PG Listing #" + inquiry.getTargetId());
        } else if (inquiry.getTargetType() == TargetType.MESS) {
            targetTitle = messProfileRepository.findById(inquiry.getTargetId())
                    .map(MessProfile::getName).orElse("Mess #" + inquiry.getTargetId());
        }
        return InquiryResponse.from(inquiry, targetTitle);
    }
}
