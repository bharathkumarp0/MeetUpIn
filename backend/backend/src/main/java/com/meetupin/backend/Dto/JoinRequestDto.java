package com.meetupin.backend.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JoinRequestDto {

    private Integer userId;      // ← Integer NOT int
    private Integer activityId;  // ← Integer NOT int
}