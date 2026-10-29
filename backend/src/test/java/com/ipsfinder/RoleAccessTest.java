package com.ipsfinder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ipsfinder.dto.LoginRequest;
import com.ipsfinder.dto.PgListingRequest;
import com.ipsfinder.entity.Gender;
import com.ipsfinder.entity.PgType;
import com.ipsfinder.entity.SharingType;
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

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RoleAccessTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String studentToken;

    @BeforeEach
    public void setup() throws Exception {
        LoginRequest request = new LoginRequest("student@ips.com", "student123");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        studentToken = root.get("token").asText();
    }

    @Test
    @DisplayName("Public GET /api/health returns status UP without auth")
    public void testHealthCheckPublic() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")));
    }

    @Test
    @DisplayName("Student cannot access PG owner endpoint (403 Forbidden)")
    public void testStudentCannotAccessOwnerEndpoint() throws Exception {
        PgListingRequest pgRequest = PgListingRequest.builder()
                .title("Unauthorized PG")
                .type(PgType.PG)
                .rent(4000.0)
                .gender(Gender.BOYS)
                .sharing(SharingType.DOUBLE)
                .build();

        mockMvc.perform(post("/api/owner/pgs")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pgRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Student cannot access Admin endpoint (403 Forbidden)")
    public void testStudentCannotAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }
}
