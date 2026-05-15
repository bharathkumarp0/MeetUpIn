package com.meetupin.backend.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDto {
    @NotBlank(message = "Title Should not be Blank")
    private String title;

    @NotBlank(message = "Description not be Blank")
    private String description;

    @NotBlank(message = "Category not be Blank")
    private String category;

    @NotBlank(message = "Location not be Blank")
    private String location;

    private LocalDate eventDate;
    private LocalTime eventTime;
    private Integer maxMembers;
    private Integer userId;   // ✅ Integer NOT int — can hold null
}