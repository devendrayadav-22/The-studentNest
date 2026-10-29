package com.ipsfinder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ipsfinder.dto.LoginRequest;
import com.ipsfinder.dto.PgListingRequest;
import com.ipsfinder.entity.Gender;
import com.ipsfinder.entity.ListingStatus;
import com.ipsfinder.entity.PgListing;
import com.ipsfinder.entity.PgType;
import com.ipsfinder.entity.SharingType;
import com.ipsfinder.entity.User;
import com.ipsfinder.repository.PgListingRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PgListingTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PgListingRepository pgListingRepository;

    @Autowired
    private com.ipsfinder.repository.UserRepository userRepository;

    private String owner1Token;
    private String owner2Token;
    private String adminToken;

    @BeforeEach
    public void setup() throws Exception {
        owner1Token = obtainToken("owner@ips.com", "owner123");
        owner2Token = obtainToken("pgowner2@ips.com", "owner123");
        adminToken = obtainToken("admin@ips.com", "admin123");
    }

    private String obtainToken(String email, String password) throws Exception {
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, password))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    @DisplayName("Public search only returns APPROVED listings; PENDING and REJECTED are hidden")
    public void testPublicSearchExcludesPending() throws Exception {
        mockMvc.perform(get("/api/pgs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[*].status", everyItem(is("APPROVED"))));
    }

    @Test
    @DisplayName("Owner cannot edit another owner's PG listing (403 Forbidden)")
    public void testOwnerCannotEditOthersListing() throws Exception {
        // Find a listing belonging to owner 1
        User owner1 = userRepository.findByEmail("owner@ips.com").orElseThrow();
        List<PgListing> owner1Listings = pgListingRepository.findByOwnerId(owner1.getId());
        PgListing targetPg = owner1Listings.get(0);

        PgListingRequest updateReq = PgListingRequest.builder()
                .title("Hacked Title")
                .type(targetPg.getType())
                .rent(targetPg.getRent())
                .gender(targetPg.getGender())
                .sharing(targetPg.getSharing())
                .build();

        // Owner 2 attempts to edit Owner 1's listing
        mockMvc.perform(put("/api/owner/pgs/" + targetPg.getId())
                        .header("Authorization", "Bearer " + owner2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin approving a PENDING listing makes it APPROVED and verified=true")
    public void testAdminApproveMakesPublicAndVerified() throws Exception {
        // Owner 1 creates a new PG listing
        PgListingRequest newPg = PgListingRequest.builder()
                .title("Brand New Test Residency")
                .description("Test Description")
                .type(PgType.PG)
                .rent(5000.0)
                .gender(Gender.BOYS)
                .sharing(SharingType.DOUBLE)
                .address("Rajendra Nagar, Indore")
                .lat(22.6850)
                .lng(75.8400)
                .availableBeds(4)
                .build();

        MvcResult createRes = mockMvc.perform(post("/api/owner/pgs")
                        .header("Authorization", "Bearer " + owner1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newPg)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.verified", is(false)))
                .andReturn();

        JsonNode createdNode = objectMapper.readTree(createRes.getResponse().getContentAsString());
        long newId = createdNode.get("id").asLong();

        // Admin approves the listing
        mockMvc.perform(post("/api/admin/pgs/" + newId + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("APPROVED")))
                .andExpect(jsonPath("$.verified", is(true)));

        // Now public search for this title returns it
        mockMvc.perform(get("/api/pgs?q=Brand New Test Residency"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id", is((int) newId)))
                .andExpect(jsonPath("$.content[0].verified", is(true)));
    }

    @Test
    @DisplayName("Public search filters by maxDistanceKm correctly")
    public void testDistanceFilter() throws Exception {
        // Search within 2.0 km of IPS Academy (lat 22.6900, lng 75.8700)
        mockMvc.perform(get("/api/pgs?maxDistanceKm=2.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[*].distanceKm", everyItem(lessThanOrEqualTo(2.0))));
    }
}
