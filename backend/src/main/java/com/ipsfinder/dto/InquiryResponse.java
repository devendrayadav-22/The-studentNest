package com.ipsfinder.dto;

import com.ipsfinder.entity.Inquiry;
import com.ipsfinder.entity.InquiryStatus;
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
public class InquiryResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentPhone;

    private TargetType targetType;
    private Long targetId;
    private String targetTitle;

    private Long ownerId;
    private String ownerName;

    private String message;
    private InquiryStatus status;
    private LocalDateTime createdAt;

    public static InquiryResponse from(Inquiry inquiry, String targetTitle) {
        if (inquiry == null) return null;
        return InquiryResponse.builder()
                .id(inquiry.getId())
                .studentId(inquiry.getStudent() != null ? inquiry.getStudent().getId() : null)
                .studentName(inquiry.getStudent() != null ? inquiry.getStudent().getName() : null)
                .studentEmail(inquiry.getStudent() != null ? inquiry.getStudent().getEmail() : null)
                .studentPhone(inquiry.getStudent() != null ? inquiry.getStudent().getPhone() : null)
                .targetType(inquiry.getTargetType())
                .targetId(inquiry.getTargetId())
                .targetTitle(targetTitle)
                .ownerId(inquiry.getOwner() != null ? inquiry.getOwner().getId() : null)
                .ownerName(inquiry.getOwner() != null ? inquiry.getOwner().getName() : null)
                .message(inquiry.getMessage())
                .status(inquiry.getStatus())
                .createdAt(inquiry.getCreatedAt())
                .build();
    }
}
