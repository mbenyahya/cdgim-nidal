package com.cgdim.repository;

import com.cgdim.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findByResourceId(Long resourceId);

    List<Assignment> findByProjectId(Long projectId);

    List<Assignment> findByResourceIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long resourceId, LocalDate endDate, LocalDate startDate);
}
