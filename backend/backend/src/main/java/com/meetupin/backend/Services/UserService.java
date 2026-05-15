package com.meetupin.backend.Services;

import com.meetupin.backend.Dto.LoginDto;
import com.meetupin.backend.Dto.UserDto;
import com.meetupin.backend.Repo.UserRepo;
import com.meetupin.backend.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private UserRepo userRepo;
    private PasswordEncoder bCryptPasswordEncoder;
    @Autowired
    public UserService(UserRepo userRepo, PasswordEncoder bCryptPasswordEncoder){
        this.bCryptPasswordEncoder=bCryptPasswordEncoder;
        this.userRepo=userRepo;
    }

    public User RegisterUser(User user){
        String passwords=user.getPassword();
        user.setPassword(bCryptPasswordEncoder.encode(passwords));
        return  userRepo.save(user);
    }

   public Optional<User> GetUserById(int id){
        return userRepo.findById(id);
   }
  public User gituserbyemail(String email){
       return userRepo.findByEmail(email);
  }
    public User getUserLogin(LoginDto loginDto) {
        return userRepo.findByEmail(loginDto.getEmail());

    }

    // ✅ FIXED CODE — replace the whole method with this:
    public User getCurrentUser() {
        // getPrincipal() returns the email String (set by your JwtFilter)
        String email = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return userRepo.findByEmail(email);
    }


}
