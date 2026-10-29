package com.ipsfinder.dto;

import com.ipsfinder.entity.Gender;
import com.ipsfinder.entity.PgType;
import com.ipsfinder.entity.SharingType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PgListingRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Listing type is required (PG, HOSTEL, FLAT)")
    private PgType type;

    @NotNull(message = "Rent is required")
    @Min(value = 1, message = "Rent must be greater than 0")
    private Double rent;

    private Double deposit;

    @NotNull(message = "Gender category is required (BOYS, GIRLS, ANY)")
    private Gender gender;

    @NotNull(message = "Sharing type is required (SINGLE, DOUBLE, TRIPLE)")
    private SharingType sharing;

    private List<String> facilities;

    private String rules;

    private List<String> images;

    private String address;

    private Double lat;

    private Double lng;

    @Min(value = 0, message = "Available beds cannot be negative")
    private Integer availableBeds;
}
