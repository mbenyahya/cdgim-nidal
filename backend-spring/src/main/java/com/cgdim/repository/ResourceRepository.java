package com.cgdim.repository;

import com.cgdim.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByNameContainingIgnoreCase(String name);

    List<Resource> findByClientId(Long clientId);

    List<Resource> findByType(String type);
}
