package com.spiraltrack.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StudentResponse {

    private Long id;
    private String name;
    private String phone;
    private LocalDateTime createdAt;

    // Student statistics
    private int distinctSubjectsCount;
    private int totalOrdersCount;
    private int totalCopiesOrdered;
    private int totalCopiesReceived;
    private int ordersAwaitingDelivery;
    private BigDecimal totalAmount;
    private BigDecimal totalPaid;
    private BigDecimal totalOutstanding;

    public StudentResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public int getDistinctSubjectsCount() {
        return distinctSubjectsCount;
    }

    public void setDistinctSubjectsCount(int distinctSubjectsCount) {
        this.distinctSubjectsCount = distinctSubjectsCount;
    }

    public int getTotalOrdersCount() {
        return totalOrdersCount;
    }

    public void setTotalOrdersCount(int totalOrdersCount) {
        this.totalOrdersCount = totalOrdersCount;
    }

    public int getTotalCopiesOrdered() {
        return totalCopiesOrdered;
    }

    public void setTotalCopiesOrdered(int totalCopiesOrdered) {
        this.totalCopiesOrdered = totalCopiesOrdered;
    }

    public int getTotalCopiesReceived() {
        return totalCopiesReceived;
    }

    public void setTotalCopiesReceived(int totalCopiesReceived) {
        this.totalCopiesReceived = totalCopiesReceived;
    }

    public int getOrdersAwaitingDelivery() {
        return ordersAwaitingDelivery;
    }

    public void setOrdersAwaitingDelivery(int ordersAwaitingDelivery) {
        this.ordersAwaitingDelivery = ordersAwaitingDelivery;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getTotalPaid() {
        return totalPaid;
    }

    public void setTotalPaid(BigDecimal totalPaid) {
        this.totalPaid = totalPaid;
    }

    public BigDecimal getTotalOutstanding() {
        return totalOutstanding;
    }

    public void setTotalOutstanding(BigDecimal totalOutstanding) {
        this.totalOutstanding = totalOutstanding;
    }
}
