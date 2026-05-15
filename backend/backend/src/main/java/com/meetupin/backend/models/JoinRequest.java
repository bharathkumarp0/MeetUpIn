// =====================================
// JoinRequest.java
// =====================================
package com.meetupin.backend.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "join_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JoinRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "activity_id")
    private Activity activity;

    @Column(name = "request_status")
    private String requestStatus;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
}