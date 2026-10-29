package com.ipsfinder.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pg_listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PgListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PgType type;

    @Column(nullable = false)
    private Double rent;

    private Double deposit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SharingType sharing;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pg_facilities", joinColumns = @JoinColumn(name = "pg_id"))
    @Column(name = "facility")
    @Builder.Default
    private List<String> facilities = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String rules;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pg_images", joinColumns = @JoinColumn(name = "pg_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    private String address;

    private Double lat;

    private Double lng;

    private Integer availableBeds;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ListingStatus status = ListingStatus.PENDING;

    @Builder.Default
    @Column(nullable = false)
    private boolean verified = false;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private LocalDateTime lastUpdated;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(nullable = false)
    private Long viewCount = 0L;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (lastUpdated == null) {
            lastUpdated = now;
        }
    }
}
