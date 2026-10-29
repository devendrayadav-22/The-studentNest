package com.ipsfinder.service;

import com.ipsfinder.dto.*;
import com.ipsfinder.entity.*;
import com.ipsfinder.exception.ForbiddenException;
import com.ipsfinder.exception.ResourceNotFoundException;
import com.ipsfinder.repository.InquiryRepository;
import com.ipsfinder.repository.MenuItemRepository;
import com.ipsfinder.repository.MessProfileRepository;
import com.ipsfinder.repository.ReviewRepository;
import com.ipsfinder.repository.UserRepository;
import com.ipsfinder.security.UserPrincipal;
import com.ipsfinder.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessProfileService {

    private final MessProfileRepository messProfileRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final InquiryRepository inquiryRepository;

    @Value("${college.lat:22.6900}")
    private double collegeLat;

    @Value("${college.lng:75.8700}")
    private double collegeLng;

    @Transactional
    public MessProfileResponse createOrUpdateProfile(MessProfileRequest request, UserPrincipal principal) {
        User owner = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Optional<MessProfile> existing = messProfileRepository.findByOwnerId(principal.getId());
        LocalDateTime now = LocalDateTime.now();
        MessProfile mess;

        if (existing.isPresent()) {
            mess = existing.get();
            mess.setName(request.getName().trim());
            mess.setDescription(request.getDescription());
            mess.setFoodType(request.getFoodType());
            mess.setOpenTime(request.getOpenTime());
            mess.setCloseTime(request.getCloseTime());
            mess.setPricePerMeal(request.getPricePerMeal());
            mess.setMonthlyPrice(request.getMonthlyPrice());
            mess.setDeliveryCharge(request.getDeliveryCharge());
            mess.setDeliveryArea(request.getDeliveryArea());
            mess.setAddress(request.getAddress());
            mess.setLat(request.getLat());
            mess.setLng(request.getLng());
            if (request.getImages() != null) {
                mess.setImages(new ArrayList<>(request.getImages()));
            }
            if (request.getIsOpen() != null) {
                mess.setIsOpen(request.getIsOpen());
            }
            // Keep status if already approved, update lastUpdated
            mess.setLastUpdated(now);
        } else {
            mess = MessProfile.builder()
                    .owner(owner)
                    .name(request.getName().trim())
                    .description(request.getDescription())
                    .foodType(request.getFoodType())
                    .openTime(request.getOpenTime())
                    .closeTime(request.getCloseTime())
                    .pricePerMeal(request.getPricePerMeal())
                    .monthlyPrice(request.getMonthlyPrice())
                    .deliveryCharge(request.getDeliveryCharge())
                    .deliveryArea(request.getDeliveryArea())
                    .address(request.getAddress())
                    .lat(request.getLat())
                    .lng(request.getLng())
                    .images(request.getImages() != null ? new ArrayList<>(request.getImages()) : new ArrayList<>())
                    .isOpen(request.getIsOpen() != null ? request.getIsOpen() : true)
                    .status(ListingStatus.PENDING)
                    .verified(false)
                    .createdAt(now)
                    .lastUpdated(now)
                    .build();
        }

        mess = messProfileRepository.save(mess);
        return mapToResponse(mess, true);
    }

    @Transactional(readOnly = true)
    public MessProfileResponse getOwnerProfile(UserPrincipal principal) {
        MessProfile mess = messProfileRepository.findByOwnerId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Mess profile not found for current owner"));
        return mapToResponse(mess, true);
    }

    @Transactional
    public MessProfileResponse toggleOpen(UserPrincipal principal) {
        MessProfile mess = messProfileRepository.findByOwnerId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Mess profile not found for current owner"));
        mess.setIsOpen(!mess.isOpen());
        mess.setLastUpdated(LocalDateTime.now());
        mess = messProfileRepository.save(mess);
        return mapToResponse(mess, true);
    }

    @Transactional
    public MessProfileResponse confirmAvailability(UserPrincipal principal) {
        MessProfile mess = messProfileRepository.findByOwnerId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Mess profile not found for current owner"));
        mess.setLastUpdated(LocalDateTime.now());
        mess = messProfileRepository.save(mess);
        return mapToResponse(mess, true);
    }

    @Transactional(readOnly = true)
    public MessStatsResponse getOwnerStats(UserPrincipal principal) {
        MessProfile mess = messProfileRepository.findByOwnerId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Mess profile not found for current owner"));

        List<MenuItem> items = menuItemRepository.findByMessId(mess.getId());
        long inquiries = inquiryRepository.countByOwnerId(principal.getId());

        return MessStatsResponse.builder()
                .totalMenuItems(items.size())
                .isOpen(mess.isOpen())
                .verified(mess.isVerified())
                .status(mess.getStatus())
                .totalInquiries(inquiries)
                .build();
    }

    private static final ZoneId KOLKATA_ZONE = ZoneId.of("Asia/Kolkata");

    public static LocalTime parseTime(String timeStr) {
        if (timeStr == null || timeStr.isBlank()) return null;
        String s = timeStr.trim().toUpperCase();
        DateTimeFormatter[] formatters = new DateTimeFormatter[] {
            DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("hh:mma", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("h:mma", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("HH:mm"),
            DateTimeFormatter.ofPattern("H:mm")
        };
        for (DateTimeFormatter dtf : formatters) {
            try {
                return LocalTime.parse(s, dtf);
            } catch (Exception ignored) {}
        }
        return null;
    }

    public static boolean isMessOpenNow(MessProfile mess) {
        if (!mess.isOpen()) {
            return false;
        }
        LocalTime open = parseTime(mess.getOpenTime());
        LocalTime close = parseTime(mess.getCloseTime());
        if (open == null || close == null) {
            return mess.isOpen();
        }
        LocalTime now = LocalTime.now(KOLKATA_ZONE);
        if (close.isAfter(open)) {
            return !now.isBefore(open) && !now.isAfter(close);
        } else {
            // Handles closing after midnight (e.g. opens 18:00, closes 02:00)
            return !now.isBefore(open) || !now.isAfter(close);
        }
    }

    @Transactional(readOnly = true)
    public MessProfileResponse getPublicById(Long id, UserPrincipal currentUser) {
        MessProfile mess = messProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id " + id));

        boolean isApproved = mess.getStatus() == ListingStatus.APPROVED;
        boolean isOwner = currentUser != null && mess.getOwner().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser != null && currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isApproved && !isOwner && !isAdmin) {
            throw new ResourceNotFoundException("Mess not found with id " + id);
        }

        return mapToResponse(mess, true, currentUser);
    }

    @Transactional(readOnly = true)
    public PagedResponse<MessProfileResponse> searchPublic(
            String q,
            FoodType foodType,
            Double maxPrice,
            String status,
            Boolean openNow,
            Double maxDistanceKm,
            String sortBy,
            String order,
            int page,
            int size,
            UserPrincipal currentUser) {

        List<MessProfile> list = messProfileRepository.findByStatus(ListingStatus.APPROVED);

        List<MessProfileResponse> filtered = list.stream()
                .map(m -> mapToResponse(m, false, currentUser))
                .filter(res -> {
                    if (q != null && !q.isBlank()) {
                        String queryLower = q.toLowerCase().trim();
                        boolean matchesName = res.getName() != null && res.getName().toLowerCase().contains(queryLower);
                        boolean matchesDesc = res.getDescription() != null && res.getDescription().toLowerCase().contains(queryLower);
                        boolean matchesAddr = res.getAddress() != null && res.getAddress().toLowerCase().contains(queryLower);
                        if (!matchesName && !matchesDesc && !matchesAddr) return false;
                    }

                    // BUG 2 fix: Veg = VEG & BOTH, Non-veg = NONVEG & BOTH, Both = only BOTH
                    if (foodType != null) {
                        if (foodType == FoodType.VEG) {
                            if (res.getFoodType() != FoodType.VEG && res.getFoodType() != FoodType.BOTH) {
                                return false;
                            }
                        } else if (foodType == FoodType.NONVEG) {
                            if (res.getFoodType() != FoodType.NONVEG && res.getFoodType() != FoodType.BOTH) {
                                return false;
                            }
                        } else if (foodType == FoodType.BOTH) {
                            if (res.getFoodType() != FoodType.BOTH) {
                                return false;
                            }
                        }
                    }

                    if (maxPrice != null) {
                        double price = res.getMonthlyPrice() != null ? res.getMonthlyPrice() :
                                (res.getPricePerMeal() != null ? res.getPricePerMeal() : 0.0);
                        if (price > maxPrice) return false;
                    }

                    // BUG 1 fix: Open/Closed status filter
                    boolean filterOpen = Boolean.TRUE.equals(openNow) || "open".equalsIgnoreCase(status);
                    boolean filterClosed = "closed".equalsIgnoreCase(status);
                    if (filterOpen && !res.isOpen()) {
                        return false;
                    }
                    if (filterClosed && res.isOpen()) {
                        return false;
                    }

                    if (maxDistanceKm != null && res.getDistanceKm() != null && res.getDistanceKm() > maxDistanceKm) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        // Sorting
        Comparator<MessProfileResponse> comparator = getMessComparator(sortBy, order);
        filtered.sort(comparator);

        int totalElements = filtered.size();
        int fromIndex = Math.min(page * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);
        List<MessProfileResponse> pagedList = filtered.subList(fromIndex, toIndex);

        return PagedResponse.of(pagedList, page, size, totalElements);
    }

    private Comparator<MessProfileResponse> getMessComparator(String sortBy, String order) {
        boolean desc = "desc".equalsIgnoreCase(order);
        Comparator<MessProfileResponse> comp;

        if ("price".equalsIgnoreCase(sortBy)) {
            comp = Comparator.comparing(m -> m.getMonthlyPrice() != null ? m.getMonthlyPrice() : m.getPricePerMeal(),
                    Comparator.nullsLast(Double::compareTo));
        } else if ("distance".equalsIgnoreCase(sortBy)) {
            comp = Comparator.comparing(MessProfileResponse::getDistanceKm, Comparator.nullsLast(Double::compareTo));
        } else if ("rating".equalsIgnoreCase(sortBy)) {
            comp = Comparator.comparing(MessProfileResponse::getAverageRating, Comparator.nullsLast(Double::compareTo));
            if (order == null || order.isBlank()) desc = true;
        } else {
            comp = Comparator.comparing(MessProfileResponse::getCreatedAt, Comparator.nullsLast(LocalDateTime::compareTo));
            if (order == null || order.isBlank()) desc = true;
        }

        return desc ? comp.reversed() : comp;
    }

    // Menu Item CRUD
    @Transactional(readOnly = true)
    public List<MenuItemResponse> getMenuItems(UserPrincipal principal) {
        MessProfile mess = messProfileRepository.findByOwnerId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Mess profile not found for owner"));
        return menuItemRepository.findByMessId(mess.getId()).stream()
                .map(MenuItemResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public MenuItemResponse addMenuItem(MenuItemRequest request, UserPrincipal principal) {
        MessProfile mess = messProfileRepository.findByOwnerId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Mess profile not found for owner"));

        MenuItem item = MenuItem.builder()
                .mess(mess)
                .name(request.getName().trim())
                .foodType(request.getFoodType())
                .dayOfWeek(request.getDayOfWeek())
                .mealType(request.getMealType())
                .price(request.getPrice())
                .build();

        item = menuItemRepository.save(item);
        mess.setLastUpdated(LocalDateTime.now());
        messProfileRepository.save(mess);
        return MenuItemResponse.from(item);
    }

    @Transactional
    public MenuItemResponse updateMenuItem(Long itemId, MenuItemRequest request, UserPrincipal principal) {
        MessProfile mess = messProfileRepository.findByOwnerId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Mess profile not found for owner"));

        MenuItem item = menuItemRepository.findByIdAndMessId(itemId, mess.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id " + itemId));

        item.setName(request.getName().trim());
        item.setFoodType(request.getFoodType());
        item.setDayOfWeek(request.getDayOfWeek());
        item.setMealType(request.getMealType());
        item.setPrice(request.getPrice());

        item = menuItemRepository.save(item);
        mess.setLastUpdated(LocalDateTime.now());
        messProfileRepository.save(mess);
        return MenuItemResponse.from(item);
    }

    @Transactional
    public void deleteMenuItem(Long itemId, UserPrincipal principal) {
        MessProfile mess = messProfileRepository.findByOwnerId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Mess profile not found for owner"));

        MenuItem item = menuItemRepository.findByIdAndMessId(itemId, mess.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id " + itemId));

        menuItemRepository.delete(item);
        mess.setLastUpdated(LocalDateTime.now());
        messProfileRepository.save(mess);
    }

    public MessProfileResponse mapToResponse(MessProfile mess, boolean includeMenu) {
        return mapToResponse(mess, includeMenu, null);
    }

    public MessProfileResponse mapToResponse(MessProfile mess, boolean includeMenu, UserPrincipal currentUser) {
        Double distance = GeoUtils.calculateDistanceKm(collegeLat, collegeLng, mess.getLat(), mess.getLng());

        Long daysAgo = null;
        boolean stale = false;
        if (mess.getLastUpdated() != null) {
            daysAgo = ChronoUnit.DAYS.between(mess.getLastUpdated(), LocalDateTime.now());
            stale = daysAgo > 30;
        }

        Double avgRating = reviewRepository.findAverageRatingByTarget(TargetType.MESS, mess.getId());
        if (avgRating != null) {
            avgRating = Math.round(avgRating * 10.0) / 10.0;
        }
        Long reviewCount = reviewRepository.countByTarget(TargetType.MESS, mess.getId());

        List<MenuItemResponse> menu = null;
        if (includeMenu) {
            menu = menuItemRepository.findByMessId(mess.getId()).stream()
                    .map(MenuItemResponse::from)
                    .collect(Collectors.toList());
        }

        boolean openRealtime = isMessOpenNow(mess);
        String phone = (currentUser != null && mess.getOwner() != null) ? mess.getOwner().getPhone() : null;

        return MessProfileResponse.builder()
                .id(mess.getId())
                .ownerId(mess.getOwner() != null ? mess.getOwner().getId() : null)
                .ownerName(mess.getOwner() != null ? mess.getOwner().getName() : null)
                .ownerPhone(phone)
                .ownerBusinessName(mess.getOwner() != null ? mess.getOwner().getOwnerBusinessName() : null)
                .name(mess.getName())
                .description(mess.getDescription())
                .foodType(mess.getFoodType())
                .openTime(mess.getOpenTime())
                .closeTime(mess.getCloseTime())
                .pricePerMeal(mess.getPricePerMeal())
                .monthlyPrice(mess.getMonthlyPrice())
                .deliveryCharge(mess.getDeliveryCharge())
                .deliveryArea(mess.getDeliveryArea())
                .address(mess.getAddress())
                .lat(mess.getLat())
                .lng(mess.getLng())
                .images(mess.getImages() != null ? new ArrayList<>(mess.getImages()) : new ArrayList<>())
                .isOpen(openRealtime)
                .status(mess.getStatus())
                .verified(mess.isVerified())
                .rejectionReason(mess.getRejectionReason())
                .lastUpdated(mess.getLastUpdated())
                .createdAt(mess.getCreatedAt())
                .distanceKm(distance)
                .lastUpdatedDaysAgo(daysAgo)
                .stale(stale)
                .averageRating(avgRating)
                .reviewCount(reviewCount != null ? reviewCount : 0L)
                .menuItems(menu)
                .build();
    }
}
