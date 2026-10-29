package com.ipsfinder.dto;

import com.ipsfinder.entity.FoodType;
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
public class MessProfileRequest {

    @NotBlank(message = "Mess name is required")
    private String name;

    private String description;

    @NotNull(message = "Food type is required (VEG, NONVEG, BOTH)")
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

    private List<String> images;

    private Boolean isOpen;
}
