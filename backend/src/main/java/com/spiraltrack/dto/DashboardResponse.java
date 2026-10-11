package com.spiraltrack.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardResponse {

    private long totalOrderRecords;
    private long totalCopiesOrdered;
    private long ordersAwaitingDelivery; // ORDERED
    private long ordersReadyForCollection; // READY
    private long booksReceivedByStudents; // RECEIVED
    private BigDecimal totalAmountCollected;
    private BigDecimal totalOutstandingAmount;
    private BigDecimal cashCollected = BigDecimal.ZERO;
    private BigDecimal gpayCollected = BigDecimal.ZERO;
    private long receivedButNotFullyPaid;
    private long historicalOrderRecords;
    private long historicalCopies;

    private List<PendingPaymentSummary> pendingPayments;

    public DashboardResponse() {}

    public static class PendingPaymentSummary {
        private Long orderId;
        private Long studentId;
        private String studentName;
        private Long subjectId;
        private String subjectName;
        private Integer quantity;
        private BigDecimal totalAmount;
        private BigDecimal amountPaid;
        private BigDecimal remainingAmount;
        private String deliveryStatus;
        private String paymentStatus;

        public PendingPaymentSummary() {}

        public PendingPaymentSummary(Long orderId, Long studentId, String studentName,
                                     Long subjectId, String subjectName, Integer quantity,
                                     BigDecimal totalAmount, BigDecimal amountPaid,
                                     BigDecimal remainingAmount, String deliveryStatus, String paymentStatus) {
            this.orderId = orderId;
            this.studentId = studentId;
            this.studentName = studentName;
            this.subjectId = subjectId;
            this.subjectName = subjectName;
            this.quantity = quantity;
            this.totalAmount = totalAmount;
            this.amountPaid = amountPaid;
            this.remainingAmount = remainingAmount;
            this.deliveryStatus = deliveryStatus;
            this.paymentStatus = paymentStatus;
        }

        public Long getOrderId() {
            return orderId;
        }

        public void setOrderId(Long orderId) {
            this.orderId = orderId;
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public String getStudentName() {
            return studentName;
        }

        public void setStudentName(String studentName) {
            this.studentName = studentName;
        }

        public Long getSubjectId() {
            return subjectId;
        }

        public void setSubjectId(Long subjectId) {
            this.subjectId = subjectId;
        }

        public String getSubjectName() {
            return subjectName;
        }

        public void setSubjectName(String subjectName) {
            this.subjectName = subjectName;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
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

        public BigDecimal getRemainingAmount() {
            return remainingAmount;
        }

        public void setRemainingAmount(BigDecimal remainingAmount) {
            this.remainingAmount = remainingAmount;
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
    }

    public long getTotalOrderRecords() {
        return totalOrderRecords;
    }

    public void setTotalOrderRecords(long totalOrderRecords) {
        this.totalOrderRecords = totalOrderRecords;
    }

    public long getTotalCopiesOrdered() {
        return totalCopiesOrdered;
    }

    public void setTotalCopiesOrdered(long totalCopiesOrdered) {
        this.totalCopiesOrdered = totalCopiesOrdered;
    }

    public long getOrdersAwaitingDelivery() {
        return ordersAwaitingDelivery;
    }

    public void setOrdersAwaitingDelivery(long ordersAwaitingDelivery) {
        this.ordersAwaitingDelivery = ordersAwaitingDelivery;
    }

    public long getOrdersReadyForCollection() {
        return ordersReadyForCollection;
    }

    public void setOrdersReadyForCollection(long ordersReadyForCollection) {
        this.ordersReadyForCollection = ordersReadyForCollection;
    }

    public long getBooksReceivedByStudents() {
        return booksReceivedByStudents;
    }

    public void setBooksReceivedByStudents(long booksReceivedByStudents) {
        this.booksReceivedByStudents = booksReceivedByStudents;
    }

    public BigDecimal getTotalAmountCollected() {
        return totalAmountCollected;
    }

    public void setTotalAmountCollected(BigDecimal totalAmountCollected) {
        this.totalAmountCollected = totalAmountCollected;
    }

    public BigDecimal getTotalOutstandingAmount() {
        return totalOutstandingAmount;
    }

    public void setTotalOutstandingAmount(BigDecimal totalOutstandingAmount) {
        this.totalOutstandingAmount = totalOutstandingAmount;
    }

    public BigDecimal getCashCollected() {
        return cashCollected;
    }

    public void setCashCollected(BigDecimal cashCollected) {
        this.cashCollected = cashCollected;
    }

    public BigDecimal getGpayCollected() {
        return gpayCollected;
    }

    public void setGpayCollected(BigDecimal gpayCollected) {
        this.gpayCollected = gpayCollected;
    }

    public long getReceivedButNotFullyPaid() {
        return receivedButNotFullyPaid;
    }

    public void setReceivedButNotFullyPaid(long receivedButNotFullyPaid) {
        this.receivedButNotFullyPaid = receivedButNotFullyPaid;
    }

    public long getHistoricalOrderRecords() {
        return historicalOrderRecords;
    }

    public void setHistoricalOrderRecords(long historicalOrderRecords) {
        this.historicalOrderRecords = historicalOrderRecords;
    }

    public long getHistoricalCopies() {
        return historicalCopies;
    }

    public void setHistoricalCopies(long historicalCopies) {
        this.historicalCopies = historicalCopies;
    }

    public List<PendingPaymentSummary> getPendingPayments() {
        return pendingPayments;
    }

    public void setPendingPayments(List<PendingPaymentSummary> pendingPayments) {
        this.pendingPayments = pendingPayments;
    }
}
