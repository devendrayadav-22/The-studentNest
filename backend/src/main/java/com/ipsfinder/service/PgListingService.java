package com.ipsfinder.service;

import com.ipsfinder.dto.OwnerStatsResponse;
import com.ipsfinder.dto.PagedResponse;
import com.ipsfinder.dto.PgListingRequest;
import com.ipsfinder.dto.PgListingResponse;
import com.ipsfinder.dto.UpdateBedsRequest;
import com.ipsfinder.entity.*;
import com.ipsfinder.exception.ForbiddenException;
import com.ipsfinder.exception.ResourceNotFoundException;
import com.ipsfinder.repository.InquiryRepository;
import com.ipsfinder.repository.PgListingRepository;
import com.ipsfinder.repository.ReviewRepository;
import com.ipsfinder.repository.UserRepository;
import com.ipsfinder.security.UserPrincipal;
import com.ipsfinder.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PgListingService {

    private final PgListingRepository pgListingRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final InquiryRepository inquiryRepository;

    @Value("${college.lat:22.6900}")
    private double collegeLat;

    @Value("${college.lng:75.8700}")
    private double collegeLng;

    @Transactional
    public PgListingResponse createListing(PgListingRequest request, UserPrincipal principal) {
        User owner = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDateTime now = LocalDateTime.now();
        PgListing pg = PgListing.builder()
                .owner(owner)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .type(request.getType())
                .rent(request.getRent())
                .deposit(request.getDeposit())
                .gender(request.getGender())
                .sharing(request.getSharing())
                .facilities(request.getFacilities() != null ? new ArrayList<>(request.getFacilities()) : new ArrayList<>())
                .rules(request.getRules())
                .images(request.getImages() != null ? new ArrayList<>(request.getImages()) : new ArrayList<>())
                .address(request.getAddress())
                .lat(request.getLat())
                .lng(request.getLng())
                .availableBeds(request.getAvailableBeds() != null ? request.getAvailableBeds() : 0)
                .status(ListingStatus.PENDING)
                .verified(false)
                .rejectionReason(null)
                .createdAt(now)
                .lastUpdated(now)
                .viewCount(0L)
                .build();

        pg = pgListingRepository.save(pg);
        return mapToResponse(pg);
    }

    @Transactional(readOnly = true)
    public List<PgListingResponse> getOwnerListings(UserPrincipal principal) {
        return pgListingRepository.findByOwnerId(principal.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PgListingResponse updateListing(Long id, PgListingRequest request, UserPrincipal principal) {
        PgListing pg = pgListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PG listing not found with id " + id));

        boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !pg.getOwner().getId().equals(principal.getId())) {
            throw new ForbiddenException("You can only edit your own listings");
        }

        pg.setTitle(request.getTitle().trim());
        pg.setDescription(request.getDescription());
        pg.setType(request.getType());
        pg.setRent(request.getRent());
        pg.setDeposit(request.getDeposit());
        pg.setGender(request.getGender());
        pg.setSharing(request.getSharing());
        if (request.getFacilities() != null) {
            pg.setFacilities(new ArrayList<>(request.getFacilities()));
        }
        pg.setRules(request.getRules());
        if (request.getImages() != null) {
            pg.setImages(new ArrayList<>(request.getImages()));
        }
        pg.setAddress(request.getAddress());
        pg.setLat(request.getLat());
        pg.setLng(request.getLng());
        if (request.getAvailableBeds() != null) {
            pg.setAvailableBeds(request.getAvailableBeds());
        }

        // Rule: Owner editing an APPROVED listing keeps it approved but updates lastUpdated.
        pg.setLastUpdated(LocalDateTime.now());

        pg = pgListingRepository.save(pg);
        return mapToResponse(pg);
    }

    @Transactional
    public void deleteListing(Long id, UserPrincipal principal) {
        PgListing pg = pgListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PG listing not found with id " + id));

        boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !pg.getOwner().getId().equals(principal.getId())) {
            throw new ForbiddenException("You can only delete your own listings");
        }

        pgListingRepository.delete(pg);
    }

    @Transactional
    public PgListingResponse confirmAvailability(Long id, UserPrincipal principal) {
        PgListing pg = pgListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PG listing not found with id " + id));

        boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !pg.getOwner().getId().equals(principal.getId())) {
            throw new ForbiddenException("You can only confirm availability for your own listings");
        }

        pg.setLastUpdated(LocalDateTime.now());
        pg = pgListingRepository.save(pg);
        return mapToResponse(pg);
    }

    @Transactional
    public PgListingResponse updateBeds(Long id, UpdateBedsRequest request, UserPrincipal principal) {
        PgListing pg = pgListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PG listing not found with id " + id));

        boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !pg.getOwner().getId().equals(principal.getId())) {
            throw new ForbiddenException("You can only update beds on your own listings");
        }

        pg.setAvailableBeds(request.getAvailableBeds());
        pg.setLastUpdated(LocalDateTime.now());
        pg = pgListingRepository.save(pg);
        return mapToResponse(pg);
    }

    @Transactional(readOnly = true)
    public OwnerStatsResponse getOwnerStats(UserPrincipal principal) {
        Long ownerId = principal.getId();
        long total = pgListingRepository.countByOwnerId(ownerId);
        long approved = pgListingRepository.countByOwnerIdAndStatus(ownerId, ListingStatus.APPROVED);
        long pending = pgListingRepository.countByOwnerIdAndStatus(ownerId, ListingStatus.PENDING);
        long views = pgListingRepository.sumViewCountByOwnerId(ownerId);
        int beds = pgListingRepository.sumAvailableBedsByOwnerId(ownerId);
        long inquiries = inquiryRepository.countByOwnerId(ownerId);

        return OwnerStatsResponse.builder()
                .totalListings(total)
                .approvedListings(approved)
                .pendingListings(pending)
                .totalViews(views)
                .totalInquiries(inquiries)
                .totalBeds(beds)
                .build();
    }

    @Transactional
    public PgListingResponse getPublicById(Long id, UserPrincipal currentUser) {
        PgListing pg = pgListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PG listing not found with id " + id));

        boolean isApproved = pg.getStatus() == ListingStatus.APPROVED;
        boolean isOwner = currentUser != null && pg.getOwner().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser != null && currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isApproved && !isOwner && !isAdmin) {
            throw new ResourceNotFoundException("PG listing not found with id " + id);
        }

        // Increment view count on fetch
        pg.setViewCount(pg.getViewCount() + 1);
        pg = pgListingRepository.save(pg);

        return mapToResponse(pg, currentUser);
    }

    @Transactional(readOnly = true)
    public PagedResponse<PgListingResponse> searchPublic(
            String q,
            PgType type,
            Double minRent,
            Double maxRent,
            Gender gender,
            SharingType sharing,
            String facilities,
            Boolean verifiedOnly,
            Double maxDistanceKm,
            String sortBy,
            String order,
            int page,
            int size,
            UserPrincipal currentUser) {

        // Fetch all approved listings
        List<PgListing> list = pgListingRepository.findByStatus(ListingStatus.APPROVED);

        List<String> requiredFacilities = (facilities != null && !facilities.isBlank())
                ? Arrays.stream(facilities.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(String::toUpperCase)
                        .collect(Collectors.toList())
                : Collections.emptyList();

        List<PgListingResponse> filtered = list.stream()
                .map(m -> mapToResponse(m, currentUser))
                .filter(res -> {
                    // Search text (title, address, description)
                    if (q != null && !q.isBlank()) {
                        String queryLower = q.toLowerCase().trim();
                        boolean matchesTitle = res.getTitle() != null && res.getTitle().toLowerCase().contains(queryLower);
                        boolean matchesDesc = res.getDescription() != null && res.getDescription().toLowerCase().contains(queryLower);
                        boolean matchesAddr = res.getAddress() != null && res.getAddress().toLowerCase().contains(queryLower);
                        if (!matchesTitle && !matchesDesc && !matchesAddr) return false;
                    }
                    // Type filter
                    if (type != null && res.getType() != type) {
                        return false;
                    }
                    // Min rent
                    if (minRent != null && res.getRent() < minRent) {
                        return false;
                    }
                    // Max rent
                    if (maxRent != null && res.getRent() > maxRent) {
                        return false;
                    }
                    // Gender filter (if user filters by BOYS, matches BOYS or ANY)
                    if (gender != null && res.getGender() != Gender.ANY && res.getGender() != gender) {
                        return false;
                    }
                    // Sharing filter
                    if (sharing != null && res.getSharing() != sharing) {
                        return false;
                    }
                    // Verified only
                    if (Boolean.TRUE.equals(verifiedOnly) && !res.isVerified()) {
                        return false;
                    }
                    // Facilities: must match all
                    if (!requiredFacilities.isEmpty()) {
                        List<String> pgFacs = res.getFacilities() != null
                                ? res.getFacilities().stream().map(String::toUpperCase).collect(Collectors.toList())
                                : Collections.emptyList();
                        for (String req : requiredFacilities) {
                            if (!pgFacs.contains(req)) {
                                return false;
                            }
                        }
                    }
                    // Distance filter
                    if (maxDistanceKm != null && res.getDistanceKm() != null && res.getDistanceKm() > maxDistanceKm) {
                        return false;
                    }

                    return true;
                })
                .collect(Collectors.toList());

        // Sorting
        Comparator<PgListingResponse> comparator = getComparator(sortBy, order);
        filtered.sort(comparator);

        // Pagination
        int totalElements = filtered.size();
        int fromIndex = Math.min(page * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);
        List<PgListingResponse> pagedList = filtered.subList(fromIndex, toIndex);

        return PagedResponse.of(pagedList, page, size, totalElements);
    }

    private Comparator<PgListingResponse> getComparator(String sortBy, String order) {
        boolean desc = "desc".equalsIgnoreCase(order);
        Comparator<PgListingResponse> comp;

        if ("rent".equalsIgnoreCase(sortBy)) {
            comp = Comparator.comparing(PgListingResponse::getRent, Comparator.nullsLast(Double::compareTo));
        } else if ("distance".equalsIgnoreCase(sortBy)) {
            comp = Comparator.comparing(PgListingResponse::getDistanceKm, Comparator.nullsLast(Double::compareTo));
        } else if ("rating".equalsIgnoreCase(sortBy)) {
            comp = Comparator.comparing(PgListingResponse::getAverageRating, Comparator.nullsLast(Double::compareTo));
            // Rating default is desc
            if (order == null || order.isBlank()) {
                desc = true;
            }
        } else {
            // Default latest
            comp = Comparator.comparing(PgListingResponse::getCreatedAt, Comparator.nullsLast(LocalDateTime::compareTo));
            if (order == null || order.isBlank()) {
                desc = true;
            }
        }

        return desc ? comp.reversed() : comp;
    }

    public PgListingResponse mapToResponse(PgListing pg) {
        return mapToResponse(pg, null);
    }

    public PgListingResponse mapToResponse(PgListing pg, UserPrincipal currentUser) {
        Double distance = GeoUtils.calculateDistanceKm(collegeLat, collegeLng, pg.getLat(), pg.getLng());

        Long daysAgo = null;
        boolean stale = false;
        if (pg.getLastUpdated() != null) {
            daysAgo = ChronoUnit.DAYS.between(pg.getLastUpdated(), LocalDateTime.now());
            stale = daysAgo > 30;
        }

        Double avgRating = reviewRepository.findAverageRatingByTarget(TargetType.PG, pg.getId());
        if (avgRating != null) {
            avgRating = Math.round(avgRating * 10.0) / 10.0;
        }
        Long reviewCount = reviewRepository.countByTarget(TargetType.PG, pg.getId());

        String phone = (currentUser != null && pg.getOwner() != null) ? pg.getOwner().getPhone() : null;

        return PgListingResponse.builder()
                .id(pg.getId())
                .ownerId(pg.getOwner() != null ? pg.getOwner().getId() : null)
                .ownerName(pg.getOwner() != null ? pg.getOwner().getName() : null)
                .ownerPhone(phone)
                .ownerBusinessName(pg.getOwner() != null ? pg.getOwner().getOwnerBusinessName() : null)
                .title(pg.getTitle())
                .description(pg.getDescription())
                .type(pg.getType())
                .rent(pg.getRent())
                .deposit(pg.getDeposit())
                .gender(pg.getGender())
                .sharing(pg.getSharing())
                .facilities(pg.getFacilities() != null ? new ArrayList<>(pg.getFacilities()) : new ArrayList<>())
                .rules(pg.getRules())
                .images(pg.getImages() != null ? new ArrayList<>(pg.getImages()) : new ArrayList<>())
                .address(pg.getAddress())
                .lat(pg.getLat())
                .lng(pg.getLng())
                .availableBeds(pg.getAvailableBeds())
                .status(pg.getStatus())
                .verified(pg.isVerified())
                .rejectionReason(pg.getRejectionReason())
                .lastUpdated(pg.getLastUpdated())
                .createdAt(pg.getCreatedAt())
                .viewCount(pg.getViewCount())
                .distanceKm(distance)
                .lastUpdatedDaysAgo(daysAgo)
                .stale(stale)
                .averageRating(avgRating)
                .reviewCount(reviewCount != null ? reviewCount : 0L)
                .build();
    }
}
