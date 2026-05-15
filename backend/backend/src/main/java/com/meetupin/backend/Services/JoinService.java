// =====================================
// JoinService.java
// =====================================
package com.meetupin.backend.Services;

import com.meetupin.backend.Dto.JoinRequestDto;
import com.meetupin.backend.Repo.ActivityRepo;
import com.meetupin.backend.Repo.JoinRepo;
import com.meetupin.backend.Repo.UserRepo;
import com.meetupin.backend.models.Activity;
import com.meetupin.backend.models.JoinRequest;
import com.meetupin.backend.models.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class JoinService {

    private final JoinRepo joinRepo;
    private final UserRepo userRepo;
    private final ActivityRepo activityRepo;
    private final UserService userService;

    public JoinService(JoinRepo joinRepo,
                       UserRepo userRepo,
                       ActivityRepo activityRepo, UserService userService) {
        this.joinRepo = joinRepo;
        this.userRepo = userRepo;
        this.activityRepo = activityRepo;
        this.userService = userService;
    }

    public JoinRequest createJoinRequest(JoinRequestDto dto) {

        // ✅ Always get user from JWT token — never trust userId from frontend
        User user = userService.getCurrentUser();

        if (user == null) {
            throw new RuntimeException("User not authenticated");
        }

        Activity activity = activityRepo.findById(dto.getActivityId())
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        // Check duplicate request
        boolean alreadyExists = joinRepo.existsByUserAndActivity(user, activity);
        if (alreadyExists) {
            throw new RuntimeException("Already requested to join this activity");
        }

        JoinRequest joinRequest = new JoinRequest();
        joinRequest.setUser(user);
        joinRequest.setActivity(activity);
        joinRequest.setRequestStatus("PENDING");
        joinRequest.setRequestedAt(java.time.LocalDateTime.now());

        return joinRepo.save(joinRequest);
    }

    // Get all requests for one activity
    public List<JoinRequest> getRequestsByActivity(int activityId) {

        Optional<Activity> activityOpt = activityRepo.findById(activityId);

        if (activityOpt.isEmpty()) {
            return Collections.emptyList();
        }

        return joinRepo.findByActivity(activityOpt.get());
    }

    // Get all requests for one user
    public List<JoinRequest> getRequestsByUser(int userId) {

        Optional<User> userOpt = userRepo.findById(userId);

        if (userOpt.isEmpty()) {
            return Collections.emptyList();
        }

        return joinRepo.findByUser(userOpt.get());
    }

    // Approve request


    // Reject request
    public JoinRequest rejectRequest(int requestId) {

        Optional<JoinRequest> requestOpt = joinRepo.findById(requestId);

        if (requestOpt.isEmpty()) {
            return null;
        }

        JoinRequest request = requestOpt.get();
        request.setRequestStatus("REJECTED");
        request.setRespondedAt(LocalDateTime.now());

        return joinRepo.save(request);
    }

    public JoinRequest approveRequest(int requestId) {

        JoinRequest jr = joinRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User currentUser = userService.getCurrentUser();

        // 🔥 AUTHORIZATION CHECK
        if (jr.getActivity().getCreatedBy().getId() != currentUser.getId()) {
            throw new RuntimeException("You are not allowed to approve this request");
        }

        jr.setRequestStatus("APPROVED");
        jr.setRespondedAt(LocalDateTime.now());

        return joinRepo.save(jr);
    }
}