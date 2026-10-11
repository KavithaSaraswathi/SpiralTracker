package com.spiraltrack.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties("orders")
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    @JsonIgnoreProperties("orders")
    private Subject subject;

    @Column(nullable = false)
    private Integer quantity = 1;

    // Pages is optional as per updated requirements
    private Integer pages;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "amount_paid", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    // Delivery status: ORDERED, READY, RECEIVED
    @Column(name = "delivery_status", nullable = false, length = 20)
    private String deliveryStatus = "ORDERED";

    // Payment status: PENDING, PARTIAL, PAID
    @Column(name = "payment_status", nullable = false, length = 20)
    private String paymentStatus = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private boolean archived = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Payment> payments = new ArrayList<>();

    public Order() {}

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.orderDate == null) {
            this.orderDate = LocalDate.now();
        }
        if (this.quantity == null || this.quantity <= 0) {
            this.quantity = 1;
        }
        if (this.deliveryStatus == null || this.deliveryStatus.trim().isEmpty()) {
            this.deliveryStatus = "ORDERED";
        }
        recalculatePaymentStatus();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        recalculatePaymentStatus();
    }

    public void recalculatePaymentStatus() {
        if (amountPaid == null) {
            amountPaid = BigDecimal.ZERO;
        }
        if (totalAmount == null) {
            totalAmount = BigDecimal.ZERO;
        }

        // Rules:
        // amountPaid == 0 -> PENDING
        // 0 < amountPaid < totalAmount -> PARTIAL
        // amountPaid >= totalAmount -> PAID
        if (amountPaid.compareTo(BigDecimal.ZERO) == 0) {
            this.paymentStatus = "PENDING";
        } else if (amountPaid.compareTo(totalAmount) < 0) {
            this.paymentStatus = "PARTIAL";
        } else {
            this.paymentStatus = "PAID";
        }
    }

    public BigDecimal getRemainingAmount() {
        if (totalAmount == null) return BigDecimal.ZERO;
        if (amountPaid == null) return totalAmount;
        BigDecimal diff = totalAmount.subtract(amountPaid);
        return diff.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : diff;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getPages() {
        return pages;
    }

    public void setPages(Integer pages) {
        this.pages = pages;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public LocalDate getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDate orderDate) {
        this.orderDate = orderDate;
    }

    public String getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(String deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public List<Payment> getPayments() {
        return payments;
    }

    public void setPayments(List<Payment> payments) {
        this.payments = payments;
    }
}
