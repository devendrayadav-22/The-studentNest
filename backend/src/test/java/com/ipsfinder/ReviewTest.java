package com.ipsfinder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ipsfinder.dto.LoginRequest;
import com.ipsfinder.dto.ReviewRequest;
import com.ipsfinder.entity.ListingStatus;
import com.ipsfinder.entity.PgListing;
import com.ipsfinder.entity.TargetType;
import com.ipsfinder.repository.PgListingRepository;
import com.ipsfinder.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
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

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ReviewTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PgListingRepository pgListingRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private com.ipsfinder.repository.UserRepository userRepository;

    private String student2Token;

    @BeforeEach
    public void setup() throws Exception {
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("student2@ips.com", "student123"))))
                .andExpect(status().isOk())
                .andReturn();
        student2Token = objectMapper.readTree(res.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    @DisplayName("Duplicate review for the same target by same student is rejected (409 Conflict)")
    public void testDuplicateReviewRejected() throws Exception {
        // Find an approved PG that student 2 has not reviewed yet or has reviewed
        List<PgListing> pgs = pgListingRepository.findByStatus(ListingStatus.APPROVED);
        PgListing pg = pgs.get(0);

        ReviewRequest req = ReviewRequest.builder()
                .targetType(TargetType.PG)
                .targetId(pg.getId())
                .rating(5)
                .comment("First review attempt")
                .build();

        com.ipsfinder.entity.User student2 = userRepository.findByEmail("student2@ips.com").orElseThrow();
        boolean alreadyReviewed = reviewRepository.existsByStudentIdAndTargetTypeAndTargetId(
                student2.getId(),
                TargetType.PG,
                pg.getId()
        );

        if (!alreadyReviewed) {
            mockMvc.perform(post("/api/reviews")
                            .header("Authorization", "Bearer " + student2Token)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated());
        }

        // Submitting duplicate review
        mockMvc.perform(post("/api/reviews")
                        .header("Authorization", "Bearer " + student2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("already reviewed")));
    }
}
