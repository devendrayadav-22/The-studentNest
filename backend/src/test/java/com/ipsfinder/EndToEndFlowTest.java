package com.ipsfinder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ipsfinder.dto.*;
import com.ipsfinder.entity.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EndToEndFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Complete End-to-End Verification Flow")
    public void testFullWorkflow() throws Exception {
        // 1. Health check
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")));

        // 2. Login for all 4 roles
        String studentToken = loginAndGetToken("student@ips.com", "student123", "STUDENT");
        String pgOwnerToken = loginAndGetToken("owner@ips.com", "owner123", "PG_OWNER");
        String messOwnerToken = loginAndGetToken("mess@ips.com", "mess123", "MESS_OWNER");
        String adminToken = loginAndGetToken("admin@ips.com", "admin123", "ADMIN");

        assertNotNull(studentToken);
        assertNotNull(pgOwnerToken);
        assertNotNull(messOwnerToken);
        assertNotNull(adminToken);

        // 3. Public PG search with filters
        mockMvc.perform(get("/api/pgs")
                        .param("q", "Bhawarkua")
                        .param("gender", "BOYS")
                        .param("minRent", "3000")
                        .param("maxRent", "7000")
                        .param("maxDistanceKm", "5.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].status", is("APPROVED")));

        // 4. Owner creates listing -> appears as PENDING and NOT in public search
        PgListingRequest newPg = PgListingRequest.builder()
                .title("Unique E2E PG Residency")
                .description("Comfortable student rooms")
                .type(PgType.PG)
                .rent(4500.0)
                .deposit(4500.0)
                .gender(Gender.BOYS)
                .sharing(SharingType.DOUBLE)
                .facilities(List.of("WIFI", "RO_WATER"))
                .address("Near IPS Campus, Indore")
                .lat(22.6880)
                .lng(75.8690)
                .availableBeds(2)
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/owner/pgs")
                        .header("Authorization", "Bearer " + pgOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newPg)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.verified", is(false)))
                .andReturn();

        JsonNode createdPgNode = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long createdPgId = createdPgNode.get("id").asLong();

        // Verify it does NOT appear in public search
        mockMvc.perform(get("/api/pgs?q=Unique E2E PG Residency"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));

        // 5. Admin approves -> now public with verified=true
        mockMvc.perform(post("/api/admin/pgs/" + createdPgId + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("APPROVED")))
                .andExpect(jsonPath("$.verified", is(true)));

        // Verify it NOW appears in public search with verified=true
        mockMvc.perform(get("/api/pgs?q=Unique E2E PG Residency"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id", is((int) createdPgId)))
                .andExpect(jsonPath("$.content[0].verified", is(true)));

        // 6. Student Review on the newly approved PG
        ReviewRequest reviewReq = ReviewRequest.builder()
                .targetType(TargetType.PG)
                .targetId(createdPgId)
                .rating(5)
                .comment("Spacious and newly built, loved it!")
                .build();

        mockMvc.perform(post("/api/reviews")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rating", is(5)))
                .andExpect(jsonPath("$.targetId", is((int) createdPgId)));

        // 7. Student Wishlist on the newly approved PG
        WishlistRequest wishlistReq = WishlistRequest.builder()
                .targetType(TargetType.PG)
                .targetId(createdPgId)
                .build();

        mockMvc.perform(post("/api/wishlist")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wishlistReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.targetId", is((int) createdPgId)));

        // 8. Student Inquiry on the newly approved PG
        InquiryRequest inquiryReq = InquiryRequest.builder()
                .targetType(TargetType.PG)
                .targetId(createdPgId)
                .message("Hello, is double sharing available immediately?")
                .build();

        mockMvc.perform(post("/api/inquiries")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inquiryReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.targetId", is((int) createdPgId)))
                .andExpect(jsonPath("$.status", is("NEW")));

        // 9. 403 when a student calls an owner or admin endpoint
        mockMvc.perform(post("/api/owner/pgs")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newPg)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    private String loginAndGetToken(String email, String password, String expectedRole) throws Exception {
        LoginRequest login = new LoginRequest(email, password);
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.user.role", is(expectedRole)))
                .andReturn();

        JsonNode root = objectMapper.readTree(res.getResponse().getContentAsString());
        return root.get("token").asText();
    }
}
