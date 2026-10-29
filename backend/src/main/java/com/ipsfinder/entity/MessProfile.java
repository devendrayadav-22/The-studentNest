package com.ipsfinder.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mess_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FoodType foodType;

    private String openTime;

    private String closeTime;

    private Double pricePerMeal;

    private Double monthlyPrice;

    private Double deliveryCharge;

    private String deliveryArea;

    private String address;

    private Double lat;

    private Double lng;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "mess_images", joinColumns = @JoinColumn(name = "mess_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Builder.Default
    @Column(nullable = false)
    private boolean isOpen = true;

    public boolean isOpen() {
        return this.isOpen;
    }

    public void setOpen(boolean open) {
        this.isOpen = open;
    }

    public void setIsOpen(boolean open) {
        this.isOpen = open;
    }

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

    @OneToMany(mappedBy = "mess", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MenuItem> menuItems = new ArrayList<>();

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
