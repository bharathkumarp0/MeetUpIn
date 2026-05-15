package com.meetupin.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GobleExceptionHandler {


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?>handleUserDtoException(MethodArgumentNotValidException ex){
        Map<String,String> errormap=new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errormap.put(error.getField(), error.getDefaultMessage());
        });

        ErrorResponse errorResponse=new ErrorResponse(
                "Validation failed",
                400,
                errormap,
                LocalDateTime.now()
        );
return ResponseEntity.badRequest().body(errorResponse);
    }

}
