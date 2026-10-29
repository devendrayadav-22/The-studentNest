package com.ipsfinder.dto;

import com.ipsfinder.entity.DayOfWeek;
import com.ipsfinder.entity.FoodType;
import com.ipsfinder.entity.MealType;
import com.ipsfinder.entity.MenuItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemResponse {

    private Long id;
    private Long messId;
    private String name;
    private FoodType foodType;
    private DayOfWeek dayOfWeek;
    private MealType mealType;
    private Double price;

    public static MenuItemResponse from(MenuItem item) {
        if (item == null) return null;
        return MenuItemResponse.builder()
                .id(item.getId())
                .messId(item.getMess() != null ? item.getMess().getId() : null)
                .name(item.getName())
                .foodType(item.getFoodType())
                .dayOfWeek(item.getDayOfWeek())
                .mealType(item.getMealType())
                .price(item.getPrice())
                .build();
    }
}
