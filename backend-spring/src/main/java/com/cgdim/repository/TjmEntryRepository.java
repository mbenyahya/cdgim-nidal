package com.cgdim.repository;

import com.cgdim.entity.TjmEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TjmEntryRepository extends JpaRepository<TjmEntry, TjmEntry.TjmEntryId> {

    List<TjmEntry> findByGridType(String gridType);
}
