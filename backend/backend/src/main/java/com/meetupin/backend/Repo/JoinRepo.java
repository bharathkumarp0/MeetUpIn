// =====================================
// JoinRepo.java
// =====================================
package com.meetupin.backend.Repo;

import com.meetupin.backend.models.Activity;
import com.meetupin.backend.models.JoinRequest;
import com.meetupin.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JoinRepo extends JpaRepository<JoinRequest, Integer> {

    List<JoinRequest> findByActivity(Activity activity);

    List<JoinRequest> findByUser(User user);

    JoinRequest findByActivityAndUser(Activity activity, User user);

    boolean existsByUserAndActivity(User user, Activity activity);

    void deleteByActivity(Activity activity);
}