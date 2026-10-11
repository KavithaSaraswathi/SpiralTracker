package com.spiraltrack.controller;

import com.spiraltrack.dto.DeliveryStatusRequest;
import com.spiraltrack.dto.OrderRequest;
import com.spiraltrack.dto.OrderResponse;
import com.spiraltrack.dto.PaymentRequest;
import com.spiraltrack.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(originPatterns = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/history")
    public ResponseEntity<List<OrderResponse>> getHistory(
            @RequestParam(required = false) String student,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) String paymentMethod) {
        return ResponseEntity.ok(orderService.getHistory(student, subject, fromDate, toDate, paymentMethod));
    }

    @GetMapping("/history/student/{studentId}")
    public ResponseEntity<List<OrderResponse>> getHistoryByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(orderService.getHistoryByStudent(studentId));
    }

    @GetMapping("/history/subject/{subjectId}")
    public ResponseEntity<List<OrderResponse>> getHistoryBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(orderService.getHistoryBySubject(subjectId));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(orderService.getOrdersByStudent(studentId));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<OrderResponse>> getOrdersBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(orderService.getOrdersBySubject(subjectId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<OrderResponse>> getPendingPaymentOrders() {
        return ResponseEntity.ok(orderService.getPendingPaymentOrders());
    }

    @GetMapping("/payment-status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByPaymentStatus(@PathVariable String status) {
        return ResponseEntity.ok(orderService.getOrdersByPaymentStatus(status));
    }

    @GetMapping("/delivery-status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByDeliveryStatus(@PathVariable String status) {
        return ResponseEntity.ok(orderService.getOrdersByDeliveryStatus(status));
    }

    @GetMapping("/search")
    public ResponseEntity<List<OrderResponse>> searchOrders(@RequestParam(name = "q", defaultValue = "") String query) {
        return ResponseEntity.ok(orderService.searchOrders(query));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> updateOrder(@PathVariable Long id, @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.updateOrder(id, request));
    }

    @PatchMapping("/{id}/payment")
    public ResponseEntity<OrderResponse> updatePayment(@PathVariable Long id, @RequestBody(required = false) PaymentRequest paymentRequest) {
        return ResponseEntity.ok(orderService.updatePayment(id, paymentRequest));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<OrderResponse> recordPayment(@PathVariable Long id, @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(orderService.recordPayment(id, request));
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<OrderResponse> archiveOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.archiveCompletedOrder(id));
    }

    @PostMapping("/{id}/record-payment")
    public ResponseEntity<OrderResponse> recordAdditionalPayment(@PathVariable Long id, @RequestBody Map<String, BigDecimal> payload) {
        BigDecimal amount = payload.get("amount");
        return ResponseEntity.ok(orderService.recordAdditionalPayment(id, amount));
    }

    @PatchMapping("/{id}/delivery-status")
    public ResponseEntity<OrderResponse> updateDeliveryStatus(@PathVariable Long id, @Valid @RequestBody DeliveryStatusRequest request) {
        return ResponseEntity.ok(orderService.updateDeliveryStatus(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
