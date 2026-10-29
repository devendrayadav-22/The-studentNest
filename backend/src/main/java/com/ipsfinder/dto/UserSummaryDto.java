package com.ipsfinder.dto;

import com.ipsfinder.entity.Role;
import com.ipsfinder.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private boolean blocked;
    private String college;
    private String course;
    private String homeCity;
    private String ownerBusinessName;
    private LocalDateTime createdAt;

    public static UserSummaryDto from(User user) {
        if (user == null) return null;
        return UserSummaryDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .blocked(user.isBlocked())
                .college(user.getCollege())
                .course(user.getCourse())
                .homeCity(user.getHomeCity())
                .ownerBusinessName(user.getOwnerBusinessName())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
