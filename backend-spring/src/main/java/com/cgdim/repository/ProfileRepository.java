package com.cgdim.repository;

import com.cgdim.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfileRepository extends JpaRepository<Profile, Long> {

    List<Profile> findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(String name, String code);
}
