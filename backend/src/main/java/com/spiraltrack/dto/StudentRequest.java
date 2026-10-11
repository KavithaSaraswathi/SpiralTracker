package com.spiraltrack.dto;

import jakarta.validation.constraints.NotBlank;

public class StudentRequest {

    @NotBlank(message = "Student name is required")
    private String name;

    private String phone;

    public StudentRequest() {}

    public StudentRequest(String name, String phone) {
        this.name = name;
        this.phone = phone;
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
}
