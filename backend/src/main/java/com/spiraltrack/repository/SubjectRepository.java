package com.spiraltrack.repository;

import com.spiraltrack.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    List<Subject> findByNameContainingIgnoreCaseOrderByNameAsc(String name);
    List<Subject> findAllByOrderByNameAsc();
}
