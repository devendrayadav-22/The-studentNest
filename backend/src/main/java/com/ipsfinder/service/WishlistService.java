package com.ipsfinder.service;

import com.ipsfinder.dto.WishlistRequest;
import com.ipsfinder.dto.WishlistResponse;
import com.ipsfinder.entity.*;
import com.ipsfinder.exception.DuplicateResourceException;
import com.ipsfinder.exception.ForbiddenException;
import com.ipsfinder.exception.ResourceNotFoundException;
import com.ipsfinder.repository.MessProfileRepository;
import com.ipsfinder.repository.PgListingRepository;
import com.ipsfinder.repository.UserRepository;
import com.ipsfinder.repository.WishlistRepository;
import com.ipsfinder.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final PgListingRepository pgListingRepository;
    private final MessProfileRepository messProfileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<WishlistResponse> getMyWishlist(UserPrincipal principal) {
        if (principal.getRole() != Role.STUDENT) {
            throw new ForbiddenException("Only students can view wishlist");
        }

        return wishlistRepository.findByStudentIdOrderByCreatedAtDesc(principal.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public WishlistResponse addToWishlist(WishlistRequest request, UserPrincipal principal) {
        if (principal.getRole() != Role.STUDENT) {
            throw new ForbiddenException("Only students can add to wishlist");
        }

        if (wishlistRepository.existsByStudentIdAndTargetTypeAndTargetId(
                principal.getId(), request.getTargetType(), request.getTargetId())) {
            throw new DuplicateResourceException("Item is already in your wishlist");
        }

        User student = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student user not found"));

        Wishlist wishlist = Wishlist.builder()
                .student(student)
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .createdAt(LocalDateTime.now())
                .build();

        wishlist = wishlistRepository.save(wishlist);
        return mapToResponse(wishlist);
    }

    @Transactional
    public void removeFromWishlist(Long id, UserPrincipal principal) {
        Wishlist wishlist = wishlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist entry not found with id " + id));

        if (!wishlist.getStudent().getId().equals(principal.getId())) {
            throw new ForbiddenException("You can only remove your own wishlist items");
        }

        wishlistRepository.delete(wishlist);
    }

    private WishlistResponse mapToResponse(Wishlist w) {
        String title = "Unknown";
        String image = null;
        Double price = null;
        String address = null;

        if (w.getTargetType() == TargetType.PG) {
            Optional<PgListing> pg = pgListingRepository.findById(w.getTargetId());
            if (pg.isPresent()) {
                title = pg.get().getTitle();
                image = (pg.get().getImages() != null && !pg.get().getImages().isEmpty())
                        ? pg.get().getImages().get(0) : null;
                price = pg.get().getRent();
                address = pg.get().getAddress();
            }
        } else if (w.getTargetType() == TargetType.MESS) {
            Optional<MessProfile> mess = messProfileRepository.findById(w.getTargetId());
            if (mess.isPresent()) {
                title = mess.get().getName();
                image = (mess.get().getImages() != null && !mess.get().getImages().isEmpty())
                        ? mess.get().getImages().get(0) : null;
                price = mess.get().getMonthlyPrice() != null ? mess.get().getMonthlyPrice() : mess.get().getPricePerMeal();
                address = mess.get().getAddress();
            }
        }

        return WishlistResponse.builder()
                .id(w.getId())
                .studentId(w.getStudent().getId())
                .targetType(w.getTargetType())
                .targetId(w.getTargetId())
                .title(title)
                .imageUrl(image)
                .price(price)
                .address(address)
                .createdAt(w.getCreatedAt())
                .build();
    }
}
