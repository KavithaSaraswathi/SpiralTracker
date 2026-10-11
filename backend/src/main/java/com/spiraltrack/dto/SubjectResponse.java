package com.spiraltrack.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SubjectResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal unitPrice;
    private LocalDateTime createdAt;

    // Subject statistics
    private int totalOrdersCount;
    private int totalCopiesOrdered;
    private int totalCopiesReceived;
    private int outstandingDeliveries;
    private BigDecimal totalCollected;
    private BigDecimal outstandingAmount;

    public SubjectResponse() {}

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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

    public int getOutstandingDeliveries() {
        return outstandingDeliveries;
    }

    public void setOutstandingDeliveries(int outstandingDeliveries) {
        this.outstandingDeliveries = outstandingDeliveries;
    }

    public BigDecimal getTotalCollected() {
        return totalCollected;
    }

    public void setTotalCollected(BigDecimal totalCollected) {
        this.totalCollected = totalCollected;
    }

    public BigDecimal getOutstandingAmount() {
        return outstandingAmount;
    }

    public void setOutstandingAmount(BigDecimal outstandingAmount) {
        this.outstandingAmount = outstandingAmount;
    }
}
