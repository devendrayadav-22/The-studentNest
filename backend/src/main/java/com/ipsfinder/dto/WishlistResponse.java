package com.ipsfinder.dto;

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
public class WishlistResponse {

    private Long id;
    private Long studentId;
    private TargetType targetType;
    private Long targetId;
    private String title;
    private String imageUrl;
    private Double price;
    private String address;
    private LocalDateTime createdAt;
}
