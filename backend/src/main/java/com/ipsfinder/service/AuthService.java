package com.ipsfinder.service;

import com.ipsfinder.dto.*;
import com.ipsfinder.entity.Role;
import com.ipsfinder.entity.User;
import com.ipsfinder.exception.BlockedUserException;
import com.ipsfinder.exception.DuplicateResourceException;
import com.ipsfinder.exception.ResourceNotFoundException;
import com.ipsfinder.repository.UserRepository;
import com.ipsfinder.security.JwtTokenProvider;
import com.ipsfinder.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("An account with email " + email + " already exists");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.STUDENT)
                .blocked(false)
                .college(request.getCollege())
                .course(request.getCourse())
                .homeCity(request.getHomeCity())
                .ownerBusinessName(request.getOwnerBusinessName())
                .build();

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());
        return AuthResponse.builder()
                .token(token)
                .user(UserSummaryDto.from(user))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (user.isBlocked()) {
            throw new BlockedUserException("Account is blocked. Contact administrator.");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());
        return AuthResponse.builder()
                .token(token)
                .user(UserSummaryDto.from(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserSummaryDto.from(user);
    }

    @Transactional
    public UserSummaryDto updateProfile(UserPrincipal principal, UpdateProfileRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getCollege() != null) {
            user.setCollege(request.getCollege());
        }
        if (request.getCourse() != null) {
            user.setCourse(request.getCourse());
        }
        if (request.getHomeCity() != null) {
            user.setHomeCity(request.getHomeCity());
        }
        if (request.getOwnerBusinessName() != null) {
            user.setOwnerBusinessName(request.getOwnerBusinessName());
        }

        user = userRepository.save(user);
        return UserSummaryDto.from(user);
    }
}
