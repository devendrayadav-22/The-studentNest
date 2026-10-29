package com.ipsfinder.dto;

import com.ipsfinder.entity.DayOfWeek;
import com.ipsfinder.entity.FoodType;
import com.ipsfinder.entity.MealType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemRequest {

    @NotBlank(message = "Item name is required")
    private String name;

    @NotNull(message = "Food type is required (VEG, NONVEG)")
    private FoodType foodType;

    @NotNull(message = "Day of week is required (MON..SUN or ALL)")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Meal type is required (BREAKFAST, LUNCH, DINNER)")
    private MealType mealType;

    private Double price;
}
