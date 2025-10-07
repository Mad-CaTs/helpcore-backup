package com.helpcore.notification_service.dto;

import lombok.Data;

@Data
public class EmailVerificationRequestDto {
    private String email;
    private String code;
}
