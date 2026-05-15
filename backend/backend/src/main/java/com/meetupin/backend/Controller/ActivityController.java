package com.meetupin.backend.Controller;

import com.meetupin.backend.Dto.ActivityDto;
import com.meetupin.backend.Repo.ActivityRepo;
import com.meetupin.backend.Repo.JoinRepo;
import com.meetupin.backend.Services.ActivityService;
import com.meetupin.backend.Services.UserService;
import com.meetupin.backend.models.Activity;
import com.meetupin.backend.models.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import jakarta.transaction.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/activities")
public class ActivityController {


    private ActivityService activityService;
    private UserService userService;
    private ActivityRepo activityRepo;
    private JoinRepo joinRepo;

    public ActivityController(ActivityService activityService ,UserService userService,ActivityRepo activityRepo,JoinRepo joinRepo){
        this.activityService=activityService;
        this.userService=userService;
        this.joinRepo=joinRepo;
        this.activityRepo=activityRepo;
    }
    @PostMapping("/")
    public ResponseEntity<?> saveActivity(@Valid @RequestBody ActivityDto activityDto, Authentication authentication) {
        User user = userService.getCurrentUser();

        Activity activity = new Activity();
        activity.setTitle(activityDto.getTitle());
        activity.setDescription(activityDto.getDescription());
        activity.setCategory(activityDto.getCategory());
        activity.setLocation(activityDto.getLocation());
        activity.setEventDate(activityDto.getEventDate());
        activity.setEventTime(activityDto.getEventTime());
        activity.setMaxMembers(activityDto.getMaxMembers());
        activity.setCreatedBy(user);
        activity.setCreatedAt(java.time.LocalDateTime.now());
        activity.setUpdatedAt(java.time.LocalDateTime.now());



        Activity savedActivity = activityService.SaveActivity(activity);

        return ResponseEntity.ok(savedActivity);
    }



    @GetMapping("/getallactivitys")
    public List<Activity>GetAllActivityes(){
        return activityService.GetAllActivity();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getActivityByid(@PathVariable int id) {
        Optional<Activity> a1 = activityService.GetActivityById(id);

        if (a1.isPresent()) {
            // Found → return 200 OK with the Activity object
            return ResponseEntity.ok(a1.get());
        } else {
            // Not found → return 404 Not Found with a message
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Activity with ID " + id + " not found");
        }
    }
    @GetMapping("/created/{id}")
    public List<Activity>Getactivitybycreator(@PathVariable int  id){
        return activityService.GetActivitiesByCreator(id);
    }
    @PutMapping("/{id}")
    public ResponseEntity<Activity> updateActivity(@PathVariable int id, @RequestBody ActivityDto activityDto) {
        Activity updatedActivity = activityService.updateActivity(id, activityDto);
        return ResponseEntity.ok(updatedActivity);
    }

    // Add this import at the top


    // Then on the delete method:
    @DeleteMapping("/{id}")
    @Transactional   // ← ADD THIS LINE
    public ResponseEntity<?> deleteActivity(@PathVariable int id) {
        try {
            User currentUser = userService.getCurrentUser();
            Activity activity = activityRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Activity not found"));

            if (activity.getCreatedBy().getId() != currentUser.getId()) {
                return ResponseEntity.status(403).body("Not authorized");
            }

            joinRepo.deleteByActivity(activity);
            activityService.DeleteActivity(id);

            return ResponseEntity.ok("Activity deleted successfully");

        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

}
