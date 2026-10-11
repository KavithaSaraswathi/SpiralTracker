package com.spiraltrack.service;

import com.spiraltrack.dto.StudentRequest;
import com.spiraltrack.dto.StudentResponse;
import com.spiraltrack.entity.Order;
import com.spiraltrack.entity.Student;
import com.spiraltrack.exception.ResourceNotFoundException;
import com.spiraltrack.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAllByOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public StudentResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return mapToResponse(student);
    }

    public List<StudentResponse> searchStudents(String name) {
        if (name == null || name.trim().isEmpty()) {
            return getAllStudents();
        }
        return studentRepository.findByNameContainingIgnoreCaseOrderByNameAsc(name.trim()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentResponse createStudent(StudentRequest request) {
        String trimmedName = request.getName().trim();
        Student student = new Student();
        student.setName(trimmedName);
        student.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);

        Student saved = studentRepository.save(student);
        return mapToResponse(saved);
    }

    @Transactional
    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        student.setName(request.getName().trim());
        student.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);

        Student updated = studentRepository.save(student);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }

    public Student getOrCreateStudent(String name, String phone) {
        String trimmedName = name.trim();
        return studentRepository.findByNameIgnoreCase(trimmedName)
                .orElseGet(() -> {
                    Student newStudent = new Student(trimmedName, phone != null ? phone.trim() : null);
                    return studentRepository.save(newStudent);
                });
    }

    public StudentResponse mapToResponse(Student student) {
        StudentResponse response = new StudentResponse();
        response.setId(student.getId());
        response.setName(student.getName());
        response.setPhone(student.getPhone());
        response.setCreatedAt(student.getCreatedAt());

        List<Order> orders = student.getOrders().stream()
                .filter(order -> !order.isArchived())
                .collect(Collectors.toList());
        if (orders != null && !orders.isEmpty()) {
            response.setTotalOrdersCount(orders.size());

            Set<Long> distinctSubjectIds = new HashSet<>();
            int totalCopiesOrdered = 0;
            int totalCopiesReceived = 0;
            int ordersAwaitingDelivery = 0;
            BigDecimal totalAmount = BigDecimal.ZERO;
            BigDecimal totalPaid = BigDecimal.ZERO;
            BigDecimal totalOutstanding = BigDecimal.ZERO;

            for (Order o : orders) {
                if (o.getSubject() != null && o.getSubject().getId() != null) {
                    distinctSubjectIds.add(o.getSubject().getId());
                }

                int qty = o.getQuantity() != null ? o.getQuantity() : 1;
                totalCopiesOrdered += qty;

                if ("RECEIVED".equalsIgnoreCase(o.getDeliveryStatus())) {
                    totalCopiesReceived += qty;
                } else {
                    ordersAwaitingDelivery++;
                }

                if (o.getTotalAmount() != null) {
                    totalAmount = totalAmount.add(o.getTotalAmount());
                }
                if (o.getAmountPaid() != null) {
                    totalPaid = totalPaid.add(o.getAmountPaid());
                }
                totalOutstanding = totalOutstanding.add(o.getRemainingAmount());
            }

            response.setDistinctSubjectsCount(distinctSubjectIds.size());
            response.setTotalCopiesOrdered(totalCopiesOrdered);
            response.setTotalCopiesReceived(totalCopiesReceived);
            response.setOrdersAwaitingDelivery(ordersAwaitingDelivery);
            response.setTotalAmount(totalAmount);
            response.setTotalPaid(totalPaid);
            response.setTotalOutstanding(totalOutstanding);
        } else {
            response.setDistinctSubjectsCount(0);
            response.setTotalOrdersCount(0);
            response.setTotalCopiesOrdered(0);
            response.setTotalCopiesReceived(0);
            response.setOrdersAwaitingDelivery(0);
            response.setTotalAmount(BigDecimal.ZERO);
            response.setTotalPaid(BigDecimal.ZERO);
            response.setTotalOutstanding(BigDecimal.ZERO);
        }

        return response;
    }
}
