package com.meetupin.backend.Repo;

import com.meetupin.backend.models.Activity;
import com.meetupin.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepo extends JpaRepository<Activity,Integer> {


    // ✅ Use JPQL query — pass int id directly, avoid the type mismatch
    @Query("SELECT a FROM Activity a WHERE a.createdBy.id = :userId")
    List<Activity> findByCreatedBy(@Param("userId") int userId);


}
