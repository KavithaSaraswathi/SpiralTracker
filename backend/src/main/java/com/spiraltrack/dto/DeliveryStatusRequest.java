package com.spiraltrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class DeliveryStatusRequest {

    @NotBlank(message = "Delivery status is required")
    @Pattern(regexp = "^(?i)(ORDERED|READY|RECEIVED)$", message = "Delivery status must be ORDERED, READY, or RECEIVED")
    private String deliveryStatus;

    public DeliveryStatusRequest() {}

    public DeliveryStatusRequest(String deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }

    public String getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(String deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }
}
