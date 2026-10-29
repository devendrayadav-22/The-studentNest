package com.ipsfinder.service;

import com.ipsfinder.dto.ReviewReplyRequest;
import com.ipsfinder.dto.ReviewRequest;
import com.ipsfinder.dto.ReviewResponse;
import com.ipsfinder.entity.*;
import com.ipsfinder.exception.DuplicateResourceException;
import com.ipsfinder.exception.ForbiddenException;
import com.ipsfinder.exception.ResourceNotFoundException;
import com.ipsfinder.repository.MessProfileRepository;
import com.ipsfinder.repository.PgListingRepository;
import com.ipsfinder.repository.ReviewRepository;
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
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PgListingRepository pgListingRepository;
    private final MessProfileRepository messProfileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsForTarget(TargetType targetType, Long targetId) {
        return reviewRepository.findByTargetTypeAndTargetIdOrderByCreatedAtDesc(targetType, targetId)
                .stream()
                .map(ReviewResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getMyReviews(UserPrincipal principal) {
        return reviewRepository.findByStudentIdOrderByCreatedAtDesc(principal.getId())
                .stream()
                .map(ReviewResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse postReview(ReviewRequest request, UserPrincipal principal) {
        if (principal.getRole() != Role.STUDENT) {
            throw new ForbiddenException("Only students can post reviews");
        }

        // Duplicate check
        if (reviewRepository.existsByStudentIdAndTargetTypeAndTargetId(
                principal.getId(), request.getTargetType(), request.getTargetId())) {
            throw new DuplicateResourceException("You have already reviewed this " + request.getTargetType());
        }

        // Verify target exists
        verifyTargetExists(request.getTargetType(), request.getTargetId());

        User student = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student user not found"));

        Review review = Review.builder()
                .student(student)
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        review = reviewRepository.save(review);
        return ReviewResponse.from(review);
    }

    @Transactional
    public ReviewResponse updateReview(Long id, ReviewRequest request, UserPrincipal principal) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id " + id));

        if (!review.getStudent().getId().equals(principal.getId())) {
            throw new ForbiddenException("You can only edit your own reviews");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review = reviewRepository.save(review);
        return ReviewResponse.from(review);
    }

    @Transactional
    public void deleteReview(Long id, UserPrincipal principal) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id " + id));

        boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !review.getStudent().getId().equals(principal.getId())) {
            throw new ForbiddenException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
    }

    @Transactional
    public ReviewResponse replyToReview(Long id, ReviewReplyRequest request, UserPrincipal principal) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id " + id));

        // Check ownership of the target PG or Mess
        boolean isOwner = isOwnerOfTarget(review.getTargetType(), review.getTargetId(), principal.getId());
        boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("You can only reply to reviews on your own listing");
        }

        review.setOwnerReply(request.getOwnerReply().trim());
        review = reviewRepository.save(review);
        return ReviewResponse.from(review);
    }

    private void verifyTargetExists(TargetType targetType, Long targetId) {
        if (targetType == TargetType.PG) {
            if (!pgListingRepository.existsById(targetId)) {
                throw new ResourceNotFoundException("PG listing not found with id " + targetId);
            }
        } else if (targetType == TargetType.MESS) {
            if (!messProfileRepository.existsById(targetId)) {
                throw new ResourceNotFoundException("Mess not found with id " + targetId);
            }
        }
    }

    private boolean isOwnerOfTarget(TargetType targetType, Long targetId, Long userId) {
        if (targetType == TargetType.PG) {
            return pgListingRepository.findById(targetId)
                    .map(pg -> pg.getOwner().getId().equals(userId))
                    .orElse(false);
        } else if (targetType == TargetType.MESS) {
            return messProfileRepository.findById(targetId)
                    .map(mess -> mess.getOwner().getId().equals(userId))
                    .orElse(false);
        }
        return false;
    }
}
