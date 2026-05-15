package com.meetupin.backend.Controller;

import com.meetupin.backend.Dto.LoginDto;
import com.meetupin.backend.Dto.UserDto;
import com.meetupin.backend.SecurityConfig.Jwtutil;
import com.meetupin.backend.Services.UserService;
import com.meetupin.backend.models.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private UserService userService;

    private PasswordEncoder bCryptPasswordEncoder;

    public  UserController(UserService userService, PasswordEncoder bCryptPasswordEncoder){
        this.bCryptPasswordEncoder=bCryptPasswordEncoder;
        this.userService=userService;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        User user = userService.getCurrentUser(); // already works after your last fix
        return ResponseEntity.ok(user);
    }


   @PostMapping("/register")
    public ResponseEntity<User> RegisterUser(@Valid @RequestBody UserDto userDto){
        User user= new User();
        user.setEmail(userDto.getEmail());
        user.setFullName(userDto.getFullName());
        user.setPassword(userDto.getPassword());
       user.setCreatedAt(LocalDateTime.now());

       User saveduser=userService.RegisterUser(user);
     return  ResponseEntity.ok(saveduser);
    }


    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@Valid @RequestBody LoginDto loginDto) {
        User user = userService.getUserLogin(loginDto);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email");
        }

        if (!bCryptPasswordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }
        String token = Jwtutil.generateToken(user.getEmail());
        return ResponseEntity.ok(token);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable int id) {
        Optional<User> u = userService.GetUserById(id);

        if (u.isPresent()) {

            return ResponseEntity.ok(u.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User with ID " + id + " not found");
        }
    }


}
