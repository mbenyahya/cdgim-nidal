package com.cgdim.repository;

import com.cgdim.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByClientId(Long clientId);

    List<Project> findByStatus(String status);

    List<Project> findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(String name, String code);
}
