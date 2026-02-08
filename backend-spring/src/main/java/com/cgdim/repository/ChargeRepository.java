package com.cgdim.repository;

import com.cgdim.entity.Charge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChargeRepository extends JpaRepository<Charge, Long> {

    List<Charge> findByClientId(Long clientId);
}
