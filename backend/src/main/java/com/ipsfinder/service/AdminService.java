package com.ipsfinder.service;

import com.ipsfinder.dto.*;
import com.ipsfinder.entity.*;
import com.ipsfinder.exception.ResourceNotFoundException;
import com.ipsfinder.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PgListingRepository pgListingRepository;
    private final MessProfileRepository messProfileRepository;
    private final ReviewRepository reviewRepository;
    private final ReportRepository reportRepository;
    private final AnnouncementRepository announcementRepository;
    private final PgListingService pgListingService;
    private final MessProfileService messProfileService;

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        List<User> users = userRepository.findAll();
        long students = users.stream().filter(u -> u.getRole() == Role.STUDENT).count();
        long pgOwners = users.stream().filter(u -> u.getRole() == Role.PG_OWNER).count();
        long messOwners = users.stream().filter(u -> u.getRole() == Role.MESS_OWNER).count();

        long totalPgs = pgListingRepository.count();
        long pendingPgs = pgListingRepository.countByStatus(ListingStatus.PENDING);
        long approvedPgs = pgListingRepository.countByStatus(ListingStatus.APPROVED);

        long totalMesses = messProfileRepository.count();
        long pendingMesses = messProfileRepository.countByStatus(ListingStatus.PENDING);
        long approvedMesses = messProfileRepository.countByStatus(ListingStatus.APPROVED);

        long totalReviews = reviewRepository.count();
        List<Report> reports = reportRepository.findAll();
        long openReports = reports.stream().filter(r -> r.getStatus() == ReportStatus.OPEN).count();

        return AdminStatsResponse.builder()
                .totalUsers(users.size())
                .totalStudents(students)
                .totalPgOwners(pgOwners)
                .totalMessOwners(messOwners)
                .totalPgs(totalPgs)
                .pendingPgs(pendingPgs)
                .approvedPgs(approvedPgs)
                .totalMesses(totalMesses)
                .pendingMesses(pendingMesses)
                .approvedMesses(approvedMesses)
                .totalReviews(totalReviews)
                .totalReports(reports.size())
                .openReports(openReports)
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPending() {
        List<PgListingResponse> pendingPgs = pgListingRepository.findByStatus(ListingStatus.PENDING).stream()
                .map(pgListingService::mapToResponse)
                .collect(Collectors.toList());

        List<MessProfileResponse> pendingMesses = messProfileRepository.findByStatus(ListingStatus.PENDING).stream()
                .map(m -> messProfileService.mapToResponse(m, true))
                .collect(Collectors.toList());

        Map<String, Object> map = new HashMap<>();
        map.put("pgs", pendingPgs);
        map.put("messes", pendingMesses);
        return map;
    }

    @Transactional
    public PgListingResponse approvePg(Long id) {
        PgListing pg = pgListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PG listing not found with id " + id));

        pg.setStatus(ListingStatus.APPROVED);
        pg.setVerified(true);
        pg.setRejectionReason(null);
        pg.setLastUpdated(LocalDateTime.now());
        pg = pgListingRepository.save(pg);
        return pgListingService.mapToResponse(pg);
    }

    @Transactional
    public PgListingResponse rejectPg(Long id, RejectRequest request) {
        PgListing pg = pgListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PG listing not found with id " + id));

        pg.setStatus(ListingStatus.REJECTED);
        pg.setVerified(false);
        pg.setRejectionReason(request.getReason().trim());
        pg.setLastUpdated(LocalDateTime.now());
        pg = pgListingRepository.save(pg);
        return pgListingService.mapToResponse(pg);
    }

    @Transactional
    public MessProfileResponse approveMess(Long id) {
        MessProfile mess = messProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id " + id));

        mess.setStatus(ListingStatus.APPROVED);
        mess.setVerified(true);
        mess.setRejectionReason(null);
        mess.setLastUpdated(LocalDateTime.now());
        mess = messProfileRepository.save(mess);
        return messProfileService.mapToResponse(mess, true);
    }

    @Transactional
    public MessProfileResponse rejectMess(Long id, RejectRequest request) {
        MessProfile mess = messProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id " + id));

        mess.setStatus(ListingStatus.REJECTED);
        mess.setVerified(false);
        mess.setRejectionReason(request.getReason().trim());
        mess.setLastUpdated(LocalDateTime.now());
        mess = messProfileRepository.save(mess);
        return messProfileService.mapToResponse(mess, true);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAllListings() {
        List<PgListingResponse> pgs = pgListingRepository.findAll().stream()
                .map(pgListingService::mapToResponse)
                .collect(Collectors.toList());

        List<MessProfileResponse> messes = messProfileRepository.findAll().stream()
                .map(m -> messProfileService.mapToResponse(m, false))
                .collect(Collectors.toList());

        Map<String, Object> map = new HashMap<>();
        map.put("pgs", pgs);
        map.put("messes", messes);
        return map;
    }

    @Transactional
    public void deletePg(Long id) {
        if (!pgListingRepository.existsById(id)) {
            throw new ResourceNotFoundException("PG listing not found with id " + id);
        }
        pgListingRepository.deleteById(id);
    }

    @Transactional
    public void deleteMess(Long id) {
        if (!messProfileRepository.existsById(id)) {
            throw new ResourceNotFoundException("Mess not found with id " + id);
        }
        messProfileRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<UserSummaryDto> getUsers(Role role) {
        List<User> list = (role != null) ? userRepository.findByRole(role) : userRepository.findAll();
        return list.stream().map(UserSummaryDto::from).collect(Collectors.toList());
    }

    @Transactional
    public UserSummaryDto blockUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
        user.setBlocked(true);
        user = userRepository.save(user);
        return UserSummaryDto.from(user);
    }

    @Transactional
    public UserSummaryDto unblockUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
        user.setBlocked(false);
        user = userRepository.save(user);
        return UserSummaryDto.from(user);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ReviewResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Review not found with id " + id);
        }
        reviewRepository.deleteById(id);
    }

    // Announcements
    @Transactional
    public AnnouncementResponse createAnnouncement(AnnouncementRequest request) {
        Announcement announcement = Announcement.builder()
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .createdAt(LocalDateTime.now())
                .build();
        announcement = announcementRepository.save(announcement);
        return AnnouncementResponse.from(announcement);
    }

    @Transactional
    public AnnouncementResponse updateAnnouncement(Long id, AnnouncementRequest request) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with id " + id));

        announcement.setTitle(request.getTitle().trim());
        announcement.setContent(request.getContent().trim());
        announcement = announcementRepository.save(announcement);
        return AnnouncementResponse.from(announcement);
    }

    @Transactional
    public void deleteAnnouncement(Long id) {
        if (!announcementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Announcement not found with id " + id);
        }
        announcementRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(AnnouncementResponse::from)
                .collect(Collectors.toList());
    }
}
