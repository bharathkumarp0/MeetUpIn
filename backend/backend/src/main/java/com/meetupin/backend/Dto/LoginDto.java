package com.meetupin.backend.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginDto {
    @NotBlank
    @Email(message = "Enter Valid Email Id")
    public String email;
    @Size(min = 5,message = "Enter Valid Password")
    public  String password;
}
