package com.ipsfinder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ipsfinder.dto.LoginRequest;
import com.ipsfinder.entity.User;
import com.ipsfinder.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Valid login returns JWT token and user profile")
    public void testValidLogin() throws Exception {
        LoginRequest request = new LoginRequest("student@ips.com", "student123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.user.email", is("student@ips.com")))
                .andExpect(jsonPath("$.user.role", is("STUDENT")));
    }

    @Test
    @DisplayName("Invalid password returns 401 Unauthorized")
    public void testInvalidPassword() throws Exception {
        LoginRequest request = new LoginRequest("student@ips.com", "wrongpass");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", containsString("Invalid email or password")));
    }

    @Test
    @DisplayName("Blocked user login is rejected with clear message")
    public void testBlockedUserCannotLogin() throws Exception {
        User user = userRepository.findByEmail("student2@ips.com").orElseThrow();
        user.setBlocked(true);
        userRepository.save(user);

        try {
            LoginRequest request = new LoginRequest("student2@ips.com", "student123");

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.message", containsString("Account is blocked. Contact administrator.")));
        } finally {
            user.setBlocked(false);
            userRepository.save(user);
        }
    }
}
