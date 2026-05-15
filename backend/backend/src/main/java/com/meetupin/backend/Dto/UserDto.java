package com.meetupin.backend.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    @NotBlank(message = "Full name is required")
    private String fullName;
    @NotBlank
    @Email(message = "Enter Valid Email Adderss")
    private String email;
    @Size(min = 5,message = "minmum 5 charaters")
    private String password;

}
