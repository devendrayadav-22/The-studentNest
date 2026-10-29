package com.ipsfinder.dto;

import com.ipsfinder.entity.Review;
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
public class ReviewResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentCollege;
    private TargetType targetType;
    private Long targetId;
    private Integer rating;
    private String comment;
    private String ownerReply;
    private LocalDateTime createdAt;

    public static ReviewResponse from(Review review) {
        if (review == null) return null;
        return ReviewResponse.builder()
                .id(review.getId())
                .studentId(review.getStudent() != null ? review.getStudent().getId() : null)
                .studentName(review.getStudent() != null ? review.getStudent().getName() : null)
                .studentCollege(review.getStudent() != null ? review.getStudent().getCollege() : null)
                .targetType(review.getTargetType())
                .targetId(review.getTargetId())
                .rating(review.getRating())
                .comment(review.getComment())
                .ownerReply(review.getOwnerReply())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
