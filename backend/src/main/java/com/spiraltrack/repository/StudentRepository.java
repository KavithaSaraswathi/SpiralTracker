package com.spiraltrack.repository;

import com.spiraltrack.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    List<Student> findByNameContainingIgnoreCaseOrderByNameAsc(String name);
    List<Student> findAllByOrderByNameAsc();
}
