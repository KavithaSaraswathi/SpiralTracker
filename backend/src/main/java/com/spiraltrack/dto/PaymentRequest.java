package com.spiraltrack.dto;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public class PaymentRequest {

    @DecimalMin(value = "0.00", message = "Amount paid cannot be negative")
    private BigDecimal amountPaid;

    private BigDecimal amount;
    private String paymentMethod;
    private String notes;
    private String idempotencyKey;

    public PaymentRequest() {}

    public PaymentRequest(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }
}
