package com.meetupin.backend.Services;

import com.meetupin.backend.Dto.ActivityDto;
import com.meetupin.backend.Repo.ActivityRepo;
import com.meetupin.backend.models.Activity;
import com.meetupin.backend.models.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ActivityService {

    private ActivityRepo activityRepo;

    private UserService userService;


    public  ActivityService(ActivityRepo activityRepo, UserService userService){
        this.activityRepo=activityRepo;
        this.userService=userService;
    }


    public Activity SaveActivity(Activity activity){
        return  activityRepo.save(activity);

    }
    public List<Activity>GetAllActivity(){
        return activityRepo.findAll();
    }


    public Optional<Activity> GetActivityById(int id){
        return activityRepo.findById(id);
    }


    public List<Activity> GetActivitiesByCreator(int id) {
        return activityRepo.findByCreatedBy(id);}

    public Activity updateActivity(int id, ActivityDto dto) {

        Activity activity = activityRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        User currentUser = userService.getCurrentUser();

        // 🔥 AUTHORIZATION CHECK
        if (activity.getCreatedBy().getId() != currentUser.getId()) {
            throw new RuntimeException("You are not allowed to update this activity");
        }

        // If allowed
        activity.setTitle(dto.getTitle());
        activity.setDescription(dto.getDescription());
        activity.setUpdatedAt(LocalDateTime.now());

        return activityRepo.save(activity);
    }


    public void DeleteActivity(int id){
        activityRepo.deleteById(id);
    }
}
