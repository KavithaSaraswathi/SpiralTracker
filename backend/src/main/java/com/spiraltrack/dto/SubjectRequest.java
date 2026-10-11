package com.spiraltrack.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class SubjectRequest {

    @NotBlank(message = "Subject name is required")
    private String name;

    private String description;

    @NotNull(message = "Subject price is required")
    @DecimalMin(value = "0.01", message = "Subject price must be greater than 0")
    private BigDecimal unitPrice;

    public SubjectRequest() {}

    public SubjectRequest(String name, String description, BigDecimal unitPrice) {
        this.name = name;
        this.description = description;
        this.unitPrice = unitPrice;
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
}
