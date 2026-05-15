// ===============================
// JoinRequestController.java
// ===============================
package com.meetupin.backend.Controller;

import com.meetupin.backend.Dto.JoinRequestDto;
import com.meetupin.backend.Services.JoinService;
import com.meetupin.backend.models.JoinRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/joinrequests")
public class JoinController {

    private final JoinService joinService;

    public JoinController(JoinService joinService) {
        this.joinService = joinService;
    }

    // Create Join Request
    @PostMapping("/")
    public ResponseEntity<?> createJoinRequest(@RequestBody JoinRequestDto dto) {
        JoinRequest saved = joinService.createJoinRequest(dto);

        if (saved == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid request or already requested");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Get all requests for one activity
    @GetMapping("/activity/{activityId}")
    public ResponseEntity<List<JoinRequest>> getRequestsByActivity(@PathVariable int activityId) {
        return ResponseEntity.ok(joinService.getRequestsByActivity(activityId));
    }

    // Get all requests by one user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<JoinRequest>> getRequestsByUser(@PathVariable int userId) {
        return ResponseEntity.ok(joinService.getRequestsByUser(userId));
    }

    // Approve request
    @PutMapping("/{requestId}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable int requestId) {
        JoinRequest request = joinService.approveRequest(requestId);

        if (request == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Join request not found");
        }

        return ResponseEntity.ok(request);
    }

    // Reject request
    @PutMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable int requestId) {
        JoinRequest request = joinService.rejectRequest(requestId);

        if (request == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Join request not found");
        }

        return ResponseEntity.ok(request);
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approve(@PathVariable int id) {
        return ResponseEntity.ok(joinService.approveRequest(id));
    }
}