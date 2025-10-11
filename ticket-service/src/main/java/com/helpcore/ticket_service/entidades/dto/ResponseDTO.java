package com.helpcore.ticket_service.entidades.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponseDTO {
    private boolean success;
    private String message;
    private Object data;
}
