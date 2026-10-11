package com.spiraltrack.service;

import com.spiraltrack.dto.DeliveryStatusRequest;
import com.spiraltrack.dto.OrderRequest;
import com.spiraltrack.dto.OrderResponse;
import com.spiraltrack.dto.PaymentRequest;
import com.spiraltrack.dto.PaymentResponse;
import com.spiraltrack.entity.Order;
import com.spiraltrack.entity.Payment;
import com.spiraltrack.entity.Student;
import com.spiraltrack.entity.Subject;
import com.spiraltrack.exception.ResourceNotFoundException;
import com.spiraltrack.repository.OrderRepository;
import com.spiraltrack.repository.LegacyPaymentMigrationRepository;
import com.spiraltrack.repository.PaymentRepository;
import com.spiraltrack.repository.StudentRepository;
import com.spiraltrack.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final LegacyPaymentMigrationRepository legacyPaymentMigrationRepository;
    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final StudentService studentService;
    private final SubjectService subjectService;

    public OrderService(OrderRepository orderRepository,
                        LegacyPaymentMigrationRepository legacyPaymentMigrationRepository,
                        PaymentRepository paymentRepository,
                        StudentRepository studentRepository,
                        SubjectRepository subjectRepository,
                        StudentService studentService,
                        SubjectService subjectService) {
        this.orderRepository = orderRepository;
        this.legacyPaymentMigrationRepository = legacyPaymentMigrationRepository;
        this.paymentRepository = paymentRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.studentService = studentService;
        this.subjectService = subjectService;
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByArchivedFalseOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapToResponse(order);
    }

    public List<OrderResponse> getOrdersByStudent(Long studentId) {
        return orderRepository.findActiveByStudentId(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersBySubject(Long subjectId) {
        return orderRepository.findActiveBySubjectId(subjectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getHistoryByStudent(Long studentId) {
        return orderRepository.findAllByArchivedTrueOrderByCompletedAtDesc().stream()
                .filter(order -> order.getStudent().getId().equals(studentId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getHistoryBySubject(Long subjectId) {
        return orderRepository.findAllByArchivedTrueOrderByCompletedAtDesc().stream()
                .filter(order -> order.getSubject().getId().equals(subjectId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getHistory(String student, String subject, LocalDate fromDate, LocalDate toDate, String paymentMethod) {
        String studentFilter = student == null ? "" : student.trim().toLowerCase();
        String subjectFilter = subject == null ? "" : subject.trim().toLowerCase();
        String methodFilter = paymentMethod == null || paymentMethod.isBlank()
                ? "" : paymentMethod.trim().toUpperCase();
        return orderRepository.findAllByArchivedTrueOrderByCompletedAtDesc().stream()
                .filter(order -> studentFilter.isEmpty() || order.getStudent().getName().toLowerCase().contains(studentFilter))
                .filter(order -> subjectFilter.isEmpty() || order.getSubject().getName().toLowerCase().contains(subjectFilter))
                .filter(order -> fromDate == null || !order.getOrderDate().isBefore(fromDate))
                .filter(order -> toDate == null || !order.getOrderDate().isAfter(toDate))
                .filter(order -> methodFilter.isEmpty() || order.getPayments().stream()
                        .anyMatch(payment -> "UNSPECIFIED".equals(methodFilter)
                                ? payment.getPaymentMethod() == null
                                : methodFilter.equals(payment.getPaymentMethod())))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByPaymentStatus(String paymentStatus) {
        return orderRepository.findAllByArchivedFalseAndPaymentStatusIgnoreCaseOrderByCreatedAtDesc(paymentStatus).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByDeliveryStatus(String deliveryStatus) {
        return orderRepository.findAllByArchivedFalseAndDeliveryStatusIgnoreCaseOrderByCreatedAtDesc(deliveryStatus).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getPendingPaymentOrders() {
        return orderRepository.findAllByArchivedFalseAndPaymentStatusNotIgnoreCaseOrderByCreatedAtDesc("PAID").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> searchOrders(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllOrders();
        }
        return orderRepository.searchActiveOrders(query.trim()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        validateOrderRequest(request);

        // 1. Resolve Student (select existing or create new)
        Student student;
        if (request.getStudentId() != null) {
            student = studentRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + request.getStudentId()));
        } else if (request.getStudentName() != null && !request.getStudentName().trim().isEmpty()) {
            student = studentService.getOrCreateStudent(request.getStudentName().trim(), request.getStudentPhone());
        } else {
            throw new IllegalArgumentException("Either Student ID or Student Name must be provided");
        }

        // 2. Resolve Subject (select existing or create new)
        Subject subject;
        if (request.getSubjectId() != null) {
            subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId()));
        } else if (request.getSubjectName() != null && !request.getSubjectName().trim().isEmpty()) {
            subject = subjectService.getOrCreateSubject(request.getSubjectName().trim(), request.getSubjectDescription());
        } else {
            throw new IllegalArgumentException("Either Subject ID or Subject Name must be provided");
        }

        int quantity = request.getQuantity() != null ? request.getQuantity() : 1;
        BigDecimal unitPrice = requireSubjectPrice(subject);
        BigDecimal totalAmount = calculateTotal(unitPrice, quantity);
        BigDecimal amountPaid = request.getAmountPaid() != null ? request.getAmountPaid() : BigDecimal.ZERO;
        validateAmountPaid(amountPaid, totalAmount);
        String initialPaymentMethod = amountPaid.compareTo(BigDecimal.ZERO) > 0
                ? normalizePaymentMethod(request.getPaymentMethod()) : null;
        if (amountPaid.compareTo(BigDecimal.ZERO) > 0 && initialPaymentMethod == null) {
            throw new IllegalArgumentException("Select Cash or GPay for the initial payment.");
        }

        Order order = new Order();
        order.setStudent(student);
        order.setSubject(subject);
        order.setQuantity(quantity);
        order.setPages(request.getPages()); // optional
        order.setUnitPrice(unitPrice);
        order.setTotalAmount(totalAmount);
        order.setAmountPaid(BigDecimal.ZERO);
        order.setOrderDate(request.getOrderDate() != null ? request.getOrderDate() : LocalDate.now());

        if (request.getDeliveryStatus() != null && !request.getDeliveryStatus().trim().isEmpty()) {
            order.setDeliveryStatus(request.getDeliveryStatus().trim().toUpperCase());
        } else {
            order.setDeliveryStatus("ORDERED");
        }

        order.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        Order saved = orderRepository.save(order);
        if (amountPaid.compareTo(BigDecimal.ZERO) > 0) {
            Payment initialPayment = new Payment();
            initialPayment.setOrder(saved);
            initialPayment.setAmount(amountPaid);
            initialPayment.setPaymentMethod(initialPaymentMethod);
            paymentRepository.save(initialPayment);
            saved.getPayments().add(initialPayment);
            saved.setAmountPaid(amountPaid);
            saved.recalculatePaymentStatus();
            saved = orderRepository.save(saved);
        }
        return mapToResponse(saved);
    }

    @Transactional
    public OrderResponse updateOrder(Long id, OrderRequest request) {
        validateOrderRequest(request);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        if (order.isArchived()) {
            throw new IllegalArgumentException("Historical orders are read-only.");
        }

        Subject currentSubject = order.getSubject();
        if (request.getStudentId() != null) {
            Student student = studentRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + request.getStudentId()));
            order.setStudent(student);
        } else if (request.getStudentName() != null && !request.getStudentName().trim().isEmpty()) {
            Student student = studentService.getOrCreateStudent(request.getStudentName().trim(), request.getStudentPhone());
            order.setStudent(student);
        }

        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId()));
            order.setSubject(subject);
        } else if (request.getSubjectName() != null && !request.getSubjectName().trim().isEmpty()) {
            Subject subject = subjectService.getOrCreateSubject(request.getSubjectName().trim(), request.getSubjectDescription());
            order.setSubject(subject);
        }

        int quantity = request.getQuantity() != null ? request.getQuantity() : 1;
        boolean subjectChanged = !Objects.equals(currentSubject.getId(), order.getSubject().getId());
        BigDecimal unitPrice = !subjectChanged && order.getUnitPrice() != null
                ? order.getUnitPrice()
                : requireSubjectPrice(order.getSubject());
        BigDecimal totalAmount = calculateTotal(unitPrice, quantity);
        BigDecimal amountPaid = order.getAmountPaid() != null ? order.getAmountPaid() : BigDecimal.ZERO;
        validateAmountPaid(amountPaid, totalAmount);

        order.setQuantity(quantity);
        order.setPages(request.getPages());
        order.setUnitPrice(unitPrice);
        order.setTotalAmount(totalAmount);
        if (request.getOrderDate() != null) {
            order.setOrderDate(request.getOrderDate());
        }
        if (request.getDeliveryStatus() != null && !request.getDeliveryStatus().trim().isEmpty()) {
            order.setDeliveryStatus(request.getDeliveryStatus().trim().toUpperCase());
        }
        order.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        order.recalculatePaymentStatus();
        Order updated = orderRepository.save(order);
        return mapToResponse(updated);
    }

    @Transactional
    public OrderResponse updatePayment(Long id, PaymentRequest paymentRequest) {
        Order order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        ensureActive(order);
        BigDecimal newAmountPaid;
        if (paymentRequest != null && paymentRequest.getAmountPaid() != null) {
            newAmountPaid = paymentRequest.getAmountPaid();
        } else {
            newAmountPaid = order.getTotalAmount();
        }

        BigDecimal currentPaid = order.getAmountPaid() != null ? order.getAmountPaid() : BigDecimal.ZERO;
        if (newAmountPaid.compareTo(currentPaid) < 0) {
            throw new IllegalArgumentException("Recorded payment transactions cannot be reduced from the payment status action.");
        }
        if (newAmountPaid.compareTo(order.getTotalAmount()) > 0) {
            throw new IllegalArgumentException("Payment amount (" + newAmountPaid + ") cannot exceed total amount (" + order.getTotalAmount() + ")");
        }
        if (newAmountPaid.compareTo(currentPaid) > 0) {
            savePayment(order, newAmountPaid.subtract(currentPaid), null,
                    "Payment method not recorded by the legacy payment action.", null);
            order.setAmountPaid(newAmountPaid);
            order.recalculatePaymentStatus();
            orderRepository.save(order);
        }
        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse recordAdditionalPayment(Long id, BigDecimal additionalAmount) {
        if (additionalAmount == null || additionalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Additional payment must be greater than 0");
        }
        Order order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        ensureActive(order);
        BigDecimal currentPaid = order.getAmountPaid() != null ? order.getAmountPaid() : BigDecimal.ZERO;
        BigDecimal nextPaid = currentPaid.add(additionalAmount);
        if (nextPaid.compareTo(order.getTotalAmount()) > 0) {
            throw new IllegalArgumentException("Payment exceeds outstanding balance. Remaining balance is ₹" + order.getRemainingAmount());
        }
        savePayment(order, additionalAmount, null,
                "Payment method not recorded by the legacy payment action.", null);
        order.setAmountPaid(nextPaid);
        order.recalculatePaymentStatus();
        orderRepository.save(order);
        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse recordPayment(Long id, PaymentRequest request) {
        if (request == null || request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than 0");
        }
        String method = normalizePaymentMethod(request.getPaymentMethod());
        if (method == null) {
            throw new IllegalArgumentException("Payment method must be CASH or GPAY");
        }

        Order order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        ensureActive(order);
        String key = request.getIdempotencyKey() == null ? null : request.getIdempotencyKey().trim();
        if (key != null && !key.isEmpty()) {
            Payment existing = paymentRepository.findByIdempotencyKey(key).orElse(null);
            if (existing != null) {
                if (!existing.getOrder().getId().equals(id)) {
                    throw new IllegalArgumentException("This payment request key was already used for another order.");
                }
                return mapToResponse(order);
            }
        }

        BigDecimal currentPaid = order.getAmountPaid() != null ? order.getAmountPaid() : BigDecimal.ZERO;
        BigDecimal nextPaid = currentPaid.add(request.getAmount());
        if (nextPaid.compareTo(order.getTotalAmount()) > 0) {
            throw new IllegalArgumentException("Payment exceeds outstanding balance. Remaining balance is ₹" + order.getRemainingAmount());
        }

        savePayment(order, request.getAmount(), method, request.getNotes(), key);
        order.setAmountPaid(nextPaid);
        order.recalculatePaymentStatus();
        orderRepository.save(order);
        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse updateDeliveryStatus(Long id, DeliveryStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        ensureActive(order);

        String status = request.getDeliveryStatus().trim().toUpperCase();
        if (!status.equals("ORDERED") && !status.equals("READY") && !status.equals("RECEIVED")) {
            throw new IllegalArgumentException("Delivery status must be ORDERED, READY, or RECEIVED");
        }

        // Updating delivery status MUST NOT change payment status
        order.setDeliveryStatus(status);
        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    @Transactional
    public OrderResponse archiveCompletedOrder(Long id) {
        Order order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        ensureActive(order);
        if (!"PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new IllegalArgumentException("Only fully paid orders can be moved to History.");
        }
        if (!"RECEIVED".equalsIgnoreCase(order.getDeliveryStatus())) {
            throw new IllegalArgumentException("The order must be marked RECEIVED before it can be moved to History.");
        }
        order.setArchived(true);
        order.setCompletedAt(LocalDateTime.now());
        return mapToResponse(orderRepository.save(order));
    }

    @Transactional
    public int reconcileLegacyPayments() {
        List<Order> legacyOrders = legacyPaymentMigrationRepository.findOrdersWithUnreconciledPayments();
        for (Order order : legacyOrders) {
            Payment legacyPayment = new Payment();
            legacyPayment.setOrder(order);
            legacyPayment.setAmount(order.getAmountPaid());
            legacyPayment.setPaymentMethod(null);
            legacyPayment.setNotes("Legacy payment; original method was not recorded.");
            paymentRepository.save(legacyPayment);
            order.getPayments().add(legacyPayment);
        }
        return legacyOrders.size();
    }

    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        if (order.isArchived()) {
            throw new IllegalArgumentException("Historical orders cannot be deleted.");
        }
        orderRepository.delete(order);
    }

    private void ensureActive(Order order) {
        if (order.isArchived()) {
            throw new IllegalArgumentException("Historical orders are read-only.");
        }
    }

    private String normalizePaymentMethod(String method) {
        if (method == null || method.isBlank()) {
            return null;
        }
        String normalized = method.trim().toUpperCase();
        if (!normalized.equals("CASH") && !normalized.equals("GPAY")) {
            throw new IllegalArgumentException("Payment method must be CASH or GPAY");
        }
        return normalized;
    }

    private void savePayment(Order order, BigDecimal amount, String method, String notes, String idempotencyKey) {
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(amount);
        payment.setPaymentMethod(method);
        payment.setNotes(notes == null || notes.isBlank() ? null : notes.trim());
        payment.setIdempotencyKey(idempotencyKey);
        paymentRepository.save(payment);
        order.getPayments().add(payment);
    }

    private void validateOrderRequest(OrderRequest request) {
        if (request.getQuantity() != null && request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }
        if (request.getTotalAmount() == null || request.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Total amount must be greater than 0");
        }
        if (request.getAmountPaid() != null && request.getAmountPaid().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount paid cannot be negative");
        }
    }

    private BigDecimal requireSubjectPrice(Subject subject) {
        BigDecimal unitPrice = subject.getUnitPrice();
        if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Fixed price is not set for subject '" + subject.getName() + "'. Set its price before creating an order.");
        }
        return unitPrice;
    }

    private BigDecimal calculateTotal(BigDecimal unitPrice, int quantity) {
        return unitPrice.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
    }

    private void validateAmountPaid(BigDecimal amountPaid, BigDecimal totalAmount) {
        if (amountPaid.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount paid cannot be negative");
        }
        if (amountPaid.compareTo(totalAmount) > 0) {
            throw new IllegalArgumentException("Amount paid cannot exceed the fixed-price order total (" + totalAmount + ")");
        }
    }

    public OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());

        if (order.getStudent() != null) {
            response.setStudentId(order.getStudent().getId());
            response.setStudentName(order.getStudent().getName());
            response.setStudentPhone(order.getStudent().getPhone());
        }

        if (order.getSubject() != null) {
            response.setSubjectId(order.getSubject().getId());
            response.setSubjectName(order.getSubject().getName());
        }

        response.setQuantity(order.getQuantity());
        response.setPages(order.getPages());
        response.setUnitPrice(getResponseUnitPrice(order));
        response.setTotalAmount(order.getTotalAmount());
        response.setAmountPaid(order.getAmountPaid());
        response.setRemainingAmount(order.getRemainingAmount());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setDeliveryStatus(order.getDeliveryStatus());
        response.setOrderDate(order.getOrderDate());
        response.setNotes(order.getNotes());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        response.setArchived(order.isArchived());
        response.setCompletedAt(order.getCompletedAt());
        response.setPayments(order.getPayments().stream()
                .map(payment -> new PaymentResponse(
                        payment.getId(),
                        payment.getAmount(),
                        payment.getPaymentMethod(),
                        payment.getPaymentDate(),
                        payment.getNotes()))
                .collect(Collectors.toList()));

        return response;
    }

    private BigDecimal getResponseUnitPrice(Order order) {
        if (order.getUnitPrice() != null) {
            return order.getUnitPrice();
        }
        if (order.getTotalAmount() != null && order.getQuantity() != null && order.getQuantity() > 0) {
            return order.getTotalAmount().divide(
                    BigDecimal.valueOf(order.getQuantity()), 2, RoundingMode.HALF_UP);
        }
        return order.getSubject() != null ? order.getSubject().getUnitPrice() : null;
    }
}
