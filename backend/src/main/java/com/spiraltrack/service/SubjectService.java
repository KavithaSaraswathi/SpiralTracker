package com.spiraltrack.service;

import com.spiraltrack.dto.SubjectRequest;
import com.spiraltrack.dto.SubjectResponse;
import com.spiraltrack.entity.Order;
import com.spiraltrack.entity.Subject;
import com.spiraltrack.exception.DuplicateResourceException;
import com.spiraltrack.exception.ResourceNotFoundException;
import com.spiraltrack.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubjectService {

    private static final BigDecimal OS_UNIT_PRICE = new BigDecimal("140.00");

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public List<SubjectResponse> getAllSubjects() {
        return subjectRepository.findAllByOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SubjectResponse getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
        return mapToResponse(subject);
    }

    public List<SubjectResponse> searchSubjects(String name) {
        if (name == null || name.trim().isEmpty()) {
            return getAllSubjects();
        }
        return subjectRepository.findByNameContainingIgnoreCaseOrderByNameAsc(name.trim()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SubjectResponse createSubject(SubjectRequest request) {
        String trimmedName = request.getName().trim();
        validateUnitPrice(trimmedName, request.getUnitPrice());
        subjectRepository.findByNameIgnoreCase(trimmedName).ifPresent(s -> {
            throw new DuplicateResourceException("Subject with name '" + trimmedName + "' already exists");
        });

        Subject subject = new Subject();
        subject.setName(trimmedName);
        subject.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        subject.setUnitPrice(request.getUnitPrice());

        Subject saved = subjectRepository.save(subject);
        return mapToResponse(saved);
    }

    @Transactional
    public SubjectResponse updateSubject(Long id, SubjectRequest request) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));

        String trimmedName = request.getName().trim();
        validateUnitPrice(trimmedName, request.getUnitPrice());
        subjectRepository.findByNameIgnoreCase(trimmedName).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new DuplicateResourceException("Subject with name '" + trimmedName + "' already exists");
            }
        });

        subject.setName(trimmedName);
        subject.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        subject.setUnitPrice(request.getUnitPrice());

        Subject updated = subjectRepository.save(subject);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Subject not found with id: " + id);
        }
        subjectRepository.deleteById(id);
    }

    public Subject getOrCreateSubject(String name, String description) {
        String trimmedName = name.trim();
        return subjectRepository.findByNameIgnoreCase(trimmedName)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Subject not found with name: " + trimmedName + ". Create the subject and set its fixed price first."));
    }

    public Subject getOrCreateSubject(String name, String description, BigDecimal unitPrice) {
        String trimmedName = name.trim();
        return subjectRepository.findByNameIgnoreCase(trimmedName).map(existing -> {
            if (existing.getUnitPrice() == null && unitPrice != null) {
                validateUnitPrice(trimmedName, unitPrice);
                existing.setUnitPrice(unitPrice);
                return subjectRepository.save(existing);
            }
            return existing;
        }).orElseGet(() -> {
            validateUnitPrice(trimmedName, unitPrice);
            Subject newSubject = new Subject(
                    trimmedName,
                    description != null ? description.trim() : null,
                    unitPrice);
            return subjectRepository.save(newSubject);
        });
    }

    public SubjectResponse mapToResponse(Subject subject) {
        SubjectResponse response = new SubjectResponse();
        response.setId(subject.getId());
        response.setName(subject.getName());
        response.setDescription(subject.getDescription());
        response.setUnitPrice(subject.getUnitPrice());
        response.setCreatedAt(subject.getCreatedAt());

        List<Order> orders = subject.getOrders().stream()
                .filter(order -> !order.isArchived())
                .collect(Collectors.toList());
        if (orders != null && !orders.isEmpty()) {
            response.setTotalOrdersCount(orders.size());

            int totalCopiesOrdered = 0;
            int totalCopiesReceived = 0;
            int outstandingDeliveries = 0;
            BigDecimal totalCollected = BigDecimal.ZERO;
            BigDecimal outstandingAmount = BigDecimal.ZERO;

            for (Order o : orders) {
                int qty = o.getQuantity() != null ? o.getQuantity() : 1;
                totalCopiesOrdered += qty;

                if ("RECEIVED".equalsIgnoreCase(o.getDeliveryStatus())) {
                    totalCopiesReceived += qty;
                } else {
                    outstandingDeliveries += qty;
                }

                if (o.getAmountPaid() != null) {
                    totalCollected = totalCollected.add(o.getAmountPaid());
                }
                outstandingAmount = outstandingAmount.add(o.getRemainingAmount());
            }

            response.setTotalCopiesOrdered(totalCopiesOrdered);
            response.setTotalCopiesReceived(totalCopiesReceived);
            response.setOutstandingDeliveries(outstandingDeliveries);
            response.setTotalCollected(totalCollected);
            response.setOutstandingAmount(outstandingAmount);
        } else {
            response.setTotalOrdersCount(0);
            response.setTotalCopiesOrdered(0);
            response.setTotalCopiesReceived(0);
            response.setOutstandingDeliveries(0);
            response.setTotalCollected(BigDecimal.ZERO);
            response.setOutstandingAmount(BigDecimal.ZERO);
        }

        return response;
    }

    private void validateUnitPrice(String name, BigDecimal unitPrice) {
        if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Subject price must be greater than 0");
        }
        if ("OS".equalsIgnoreCase(name) && unitPrice.compareTo(OS_UNIT_PRICE) != 0) {
            throw new IllegalArgumentException("OS has a fixed price of ₹140.00 per copy");
        }
    }
}
